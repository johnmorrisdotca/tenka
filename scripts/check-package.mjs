// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, and a seeded game played through. A package whose `exports` name
// a file that is not in the tarball fails here, before it can be published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "tenka-package-"));

/** Run a command and hand back what it printed. On Windows, npm is a .cmd file, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const ran = spawnSync(command, args, { cwd, encoding: "utf8", shell: viaShell && windows });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
// The README's pictures are in docs/images, for GitHub and npm to show by address, and are never in what is installed.
const shipped = [...inTarball].filter((file) => file.startsWith("docs/") || /\.(webp|png|jpe?g|gif)$/.test(file));
if (shipped.length > 0) {
  console.error(`FAIL the tarball holds pictures or docs: ${shipped.join(", ")}`);
  process.exit(1);
}
console.log("ok   no picture and nothing from docs/ is in the tarball");

// 2. Everything package.json points at is in the tarball.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
for (const file of new Set(pointed)) {
  if (!inTarball.has(file.replace(/^\.\//, ""))) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);
for (const file of inTarball) {
  if (/\.test\.|^src\/|^demo\/|^table\//.test(file)) {
    console.error(`FAIL the tarball carries ${file}, which nobody who installs it needs`);
    process.exit(1);
  }
}

// 3. Install it into an empty project, with the one optional peer its React entry needs, and none of the sibling packages
//    that only `/dressing` draws with: everything else must work without them.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball, "react"], project, true);
console.log("ok   npm install of the tarball");

// 4. Every entry in `exports`, by ESM and by require, and a seeded game that must come out as it always has.
const PEERED = [`${pkg.name}/dressing`];
const entries = Object.keys(pkg.exports).map((key) => (key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`)).filter((entry) => !PEERED.includes(entry));
const game = `
const { startTenka, playTenka, sensibleTenkaMove, tenkaOver, nextRandom, tenkaToJSON, tenkaFromJSON, encodeTenka, decodeTenka, TENKA_VERSION } = tenka;
let state = 2026;
const random = () => { const drawn = nextRandom(state); state = drawn.state; return drawn.value; };
let game = startTenka(10, ["Ann", "Ben", "Cho"], 2026);
while (!tenkaOver(game)) game = playTenka(game, sensibleTenkaMove(game, random));
if (game.moves.length !== 356 || game.winners.join() !== "1") throw new Error("the seeded game came out as " + game.moves.length + " moves, won by " + game.winners);
if (tenkaFromJSON(tenkaToJSON(game)).moves.length !== 356) throw new Error("the game did not read back from JSON");
if (decodeTenka(encodeTenka(game)).winners.join() !== "1") throw new Error("the game did not read back as kept");
if (TENKA_VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("TENKA_VERSION is " + TENKA_VERSION);
if (shapes.TENKA_SHAPES.outlines.length !== 42) throw new Error("the shapes are not forty-two outlines");
if (tenka.tenkaDailySeed(new Date("2026-10-01T12:00:00Z")) !== 20261001) throw new Error("the day's seed is not the date as a number");
`;
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
// An entry that only defines the tag on a page (the /define one) exports nothing, and is imported for its effect.
all.forEach((m, i) => { if (Object.keys(m).length === 0 && !names[i].endsWith("/define")) throw new Error(names[i] + " exports nothing"); });
const tenka = m0;
const shapes = all[names.indexOf(${JSON.stringify(`${pkg.name}/shapes`)})];
${game}
console.log(names.join(" "));
`,
);
writeFileSync(
  join(project, "cjs.cjs"),
  `const names = ${JSON.stringify(entries)};
for (const name of names) { const m = require(name); if (Object.keys(m).length === 0 && !name.endsWith("/define")) throw new Error(name + " exports nothing"); }
const tenka = require(${JSON.stringify(pkg.name)});
const shapes = require(${JSON.stringify(`${pkg.name}/shapes`)});
${game}
console.log(names.join(" "));
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);
console.log(`ok   require: ${run(process.execPath, ["cjs.cjs"], project).trim()}`);

// 5. The entry that draws with Korokoro and Toranpu: it cannot be imported without them, says which is missing, and with
//    them (at the versions this was built against) it draws a card for a territory and lands a die on the face asked for.
for (const entry of PEERED) {
  const without = spawnSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(entry)})`], { cwd: project, encoding: "utf8" });
  if (without.status === 0 || !/@johnmorrisdotca\/(korokoro|toranpu)/.test(without.stderr)) {
    console.error(`FAIL ${entry} without its peers should fail naming the missing package, and did not:\n${without.stderr}`);
    process.exit(1);
  }
}
console.log("ok   /dressing asks for Korokoro and Toranpu by name, and nothing else does");
const peers = ["korokoro", "toranpu"].map((name) => `@johnmorrisdotca/${name}@${pkg.devDependencies[`@johnmorrisdotca/${name}`]}`);
run("npm", ["install", "--no-audit", "--no-fund", "--silent", ...peers], project, true);
const dressed = `
const { tenkaDressing, tenkaCardDesign, tenkaCardId, tenkaThrownDie } = dressing;
if (typeof tenkaDressing !== "function") throw new Error("tenkaDressing is not a function");
const { cardFaceSvg } = await import("@johnmorrisdotca/toranpu/card-faces");
const { roll } = await import("@johnmorrisdotca/korokoro");
const face = cardFaceSvg(tenkaCardId("world", 11), { design: tenkaCardDesign(), title: "" });
if (face === null || !face.includes(">Brazil</text>")) throw new Error("Toranpu did not draw Brazil's card");
for (let n = 1; n <= 6; n++) if (roll({ count: 1, sides: 6 }, tenkaThrownDie(n)).faces[0] !== n) throw new Error("Korokoro did not land a die on " + n);
`;
writeFileSync(join(project, "dressing.mjs"), `import * as dressing from ${JSON.stringify(PEERED[0])};${dressed}\nconsole.log(Object.keys(dressing).length + " exports");\n`);
writeFileSync(join(project, "dressing.cjs"), `(async () => { const dressing = require(${JSON.stringify(PEERED[0])});${dressed}\nconsole.log(Object.keys(dressing).length + " exports"); })().catch((error) => { console.error(error); process.exit(1); });\n`);
console.log(`ok   dressing import:  ${run(process.execPath, ["dressing.mjs"], project).trim()}`);
console.log(`ok   dressing require: ${run(process.execPath, ["dressing.cjs"], project).trim()}`);

rmSync(scratch, { recursive: true, force: true });
console.log("the package installs and runs as published, on", process.platform, process.version);
