// The documents that are made from the source, or that quote it, checked against it.
// Plain JavaScript, so that reading files needs no Node types. `pnpm docs:make` rewrites what is made.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { TenkaTable } from "./element.ts";
import { TENKA_STRINGS } from "./strings.ts";
import { playTenka } from "./tenka.ts";
import { TENKA_CSV_COLUMNS, tenkaToJSON } from "./tenkaExport.ts";
import { startTenka } from "./tenkaStart.ts";
import { TENKA_STYLE } from "./ui/style.ts";
import { TENKA_VERSION } from "./version.ts";

// The README and the page of the API tables it links: what the package says about itself is held to the code across both.
const readme = `${readFileSync("README.md", "utf8")}\n${readFileSync("docs/API.md", "utf8")}`;
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

/** Every fenced block of the README: its language and its text. */
// A fence may carry a flag after its language (`ts no-run`, `ts no-check`): such a block is one the master check types or skips, and its kind says so.
const blocks = [...readme.matchAll(/^```([\w-]*)([^\n]*)\n([\s\S]*?)^```$/gm)].map((found) => ({ lang: `${found[1]}${found[2].trim() === "" ? "" : ` ${found[2].trim()}`}`, text: found[3] }));

/** The entries of the package, as a block of the README imports them, and the source each one is. */
const ENTRIES = {
  "@johnmorrisdotca/tenka/dressing": "src/dressing.ts",
  "@johnmorrisdotca/tenka/shapes": "src/shapes.ts",
  "@johnmorrisdotca/tenka/ui": "src/ui.ts",
  "@johnmorrisdotca/tenka": "src/index.ts",
};

/**
 * A block of the README as a module that checks itself: its imports point at the source, and every
 * line ending `// → value` becomes a check that the line comes to that value.
 */
function runnable(text) {
  let out = text;
  for (const [name, file] of Object.entries(ENTRIES)) out = out.replaceAll(`from "${name}"`, `from ${JSON.stringify(pathToFileURL(resolve(file)).href)}`);
  const lines = out.split("\n").map((line) => {
    const named = /^(\s*)(?:const|let) (\w+) = .*; \/\/ → (.*)$/.exec(line);
    if (named !== null) return `${line}\n__is(${named[2]}, (${named[3]}), ${JSON.stringify(line.trim())});`;
    const said = /^(\s*)(.+); \/\/ → (.*)$/.exec(line);
    if (said !== null) return `__is((${said[2]}), (${said[3]}), ${JSON.stringify(line.trim())});`;
    return line;
  });
  return `import { expect as __expect } from "vitest";\nconst __is = (got, want, what) => __expect(got, what).toEqual(want);\n${lines.join("\n")}\n`;
}

describe("the README's examples", () => {
  it("every block is of a kind a check runs, or is a line for a terminal", () => {
    // ts, json and csv here; html, jsx, vue, svelte and ts no-check (Angular) in scripts/check-frameworks.mjs; no-run blocks need a browser; the Architecture's tree is in docs/ARCHITECTURE.md.
    expect([...new Set(blocks.map((block) => block.lang))].sort()).toEqual(["css", "html", "js no-run", "json", "jsx", "jsx no-check", "sh", "svelte", "ts", "ts no-check", "ts no-run", "vue"]);
  });

  it("every TypeScript example runs, and every value it states is the value it comes to", async () => {
    const dir = join("node_modules", ".tenka-docs");
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const examples = blocks.filter((block) => block.lang === "ts");
    expect(examples.length).toBeGreaterThanOrEqual(8);
    let checks = 0;
    for (const [at, block] of examples.entries()) {
      expect(block.text.startsWith("import "), `example ${at + 1} imports what it uses`).toBe(true);
      const source = runnable(block.text);
      checks += source.split("__is(").length - 1;
      const file = join(dir, `readme-${at + 1}.ts`);
      writeFileSync(file, source);
      await import(/* @vite-ignore */ `${pathToFileURL(resolve(file)).href}?${Date.now()}`);
    }
    expect(checks).toBeGreaterThanOrEqual(35);
  });

  it("the JSON shown is the JSON written", () => {
    const game = playTenka(startTenka(10, ["Ann", "Ben", "Cho"], 2026), { kind: "place", territory: 1, armies: 4 });
    const shown = blocks.filter((block) => block.lang === "json");
    expect(shown.length).toBe(1);
    expect(shown[0].text).toBe(tenkaToJSON(game));
  });

  it("the CSV's columns are the ones listed", () => {
    const listed = /The CSV\*\* is a row to a move: ([\s\S]*?)\(`TENKA_CSV_COLUMNS`\)/.exec(readme)[1];
    expect([...listed.matchAll(/`(\w+)`/g)].map((found) => found[1])).toEqual([...TENKA_CSV_COLUMNS]);
  });

  it("the install lines name this package", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    for (const block of blocks.filter((one) => one.lang !== "sh" && one.lang !== "json")) {
      // Tenka's own entries, and the two sibling packages its dressing draws with.
      for (const found of block.text.matchAll(/from "(@johnmorrisdotca\/[^"]+)"/g)) {
        if (/^@johnmorrisdotca\/(korokoro|toranpu)(\/|$)/.test(found[1])) continue;
        expect(Object.keys(ENTRIES).concat("@johnmorrisdotca/tenka/react"), block.text).toContain(found[1]);
      }
    }
  });
});

/** The rows of the table under a heading: each row's cells. */
function table(heading) {
  const from = readme.indexOf(heading);
  if (from < 0) throw new Error(`the README has no “${heading}”`);
  const rows = [];
  for (const line of readme.slice(from).split("\n").slice(heading.startsWith("|") ? 0 : 1)) {
    if (line.startsWith("|")) rows.push(line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()));
    else if (rows.length > 0) break;
  }
  return rows.slice(2);
}

const codes = (text) => [...text.matchAll(/`([^`]+)`/g)].map((found) => found[1]);

describe("the README's tables", () => {
  it("every variable in the theming table is one the stylesheet defines, and none is left out", () => {
    const listed = table("## Theming").flatMap(([names]) => codes(names));
    const defined = [...new Set([...TENKA_STYLE.matchAll(/(--tk-[\w-]+):/g)].map((found) => found[1]))];
    expect(listed.sort()).toEqual(defined.sort());
  });

  it("the light and dark values in the theming table are the stylesheet's", () => {
    const light = /\.tk-root \{([\s\S]*?)display:/.exec(TENKA_STYLE)[1];
    const dark = /prefers-color-scheme: dark\) \{\s*\.tk-root \{([^}]*)\}/.exec(TENKA_STYLE)[1];
    const value = (css, name) => new RegExp(`${name}: ([^;]+);`).exec(css)?.[1];
    for (const [names, , lightCell, darkCell] of table("## Theming")) {
      const variables = codes(names);
      const lights = codes(lightCell);
      const darks = codes(darkCell);
      variables.forEach((name, at) => {
        if (name === "--tk-font") return;
        expect(value(light, name), name).toBe(lights[at]);
        if (darks.length > 0) expect(value(dark, name), `${name} in the dark`).toBe(darks[at]);
        else expect(value(dark, name), `${name} is the same in the dark`).toBeUndefined();
      });
    }
  });

  it("every constant the tables name is exported", async () => {
    const tenka = await import("./index.ts");
    const ui = await import("./ui.ts");
    for (const heading of ["| Rule | Value | Constant |", "| Limit | Value | Constant |"]) {
      const rows = table(heading);
      expect(rows.length).toBeGreaterThan(4);
      for (const row of rows) for (const name of codes(row[2])) expect(tenka[name], name).toBeDefined();
    }
    for (const heading of ["## Playing", "## The map's facts", "## Cards and dice", "## Keeping and export", "## The day's seed", "## Taps and words"]) {
      for (const [names] of table(heading)) {
        for (const code of codes(names)) expect(tenka[code.replace(/\(.*$/, "")], code).toBeDefined();
      }
    }
    for (const name of ["mountTenka", "tenkaMapModel", "tenkaMapSvg", "continentView", "nearestLand", "TENKA_SEAT_COLOURS", "TENKA_NEUTRAL_COLOUR", "ownerColour", "NO_MARKS", "TENKA_STYLE"]) {
      expect(readme, name).toContain(`\`${name}`);
      expect(ui[name], name).toBeDefined();
    }
  });

  it("every export of the main entry is named in the README", async () => {
    const tenka = await import("./index.ts");
    for (const name of Object.keys(tenka)) expect(readme.includes(`\`${name}`), `${name} is documented in the README`).toBe(true);
  });

  it("the element's attributes are the ones listed", () => {
    expect(table("| Attribute | Default | What it does |").map(([name]) => codes(name)[0])).toEqual(TenkaTable.observedAttributes);
  });

  it("the table's options and handle are the ones listed", () => {
    const source = readFileSync("src/ui/mount.ts", "utf8");
    const fields = (type) => [...new RegExp(`export type ${type} = \\{([\\s\\S]*?)\\n\\};`).exec(source)[1].matchAll(/^ {2}(\w+)\??:/gm)].map((found) => found[1]);
    expect(table("| Option | Default | What it does |").map(([name]) => codes(name)[0])).toEqual(fields("TenkaTableOptions"));
    expect(table("| Handle | What it does |").map(([name]) => codes(name)[0].replace(/\(.*$/, ""))).toEqual(fields("TenkaTableHandle"));
  });
});

describe("the documents made from the source", () => {
  it("docs/strings-ja.md lists every string in both languages", () => {
    const cell = (text) => (text === "" ? "*(nothing)*" : text.replace(/\|/g, "\\|").replace(/^ | $/g, "␠"));
    const rows = Object.keys(TENKA_STRINGS.en).map((name) => `| \`${name}\` | ${cell(TENKA_STRINGS.en[name])} | ${cell(TENKA_STRINGS.ja[name])} |`);
    const made = `# Tenka's words, in English and Japanese

Made from \`src/strings.ts\` by \`pnpm docs:make\`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. \`{n}\`, \`{name}\` and the other braces are filled in when
shown. ␠ marks a space at the start or end of a string.

| Name | English | Japanese |
| --- | --- | --- |
${rows.join("\n")}
`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });
});

describe("the demo's look", () => {
  // The family's stylesheet is one file, the same byte for byte in every sibling package's demo. It is never edited here:
  // a new one is copied in whole, and this hash with it.
  const FAMILY_CSS = "c1e392564a7fd94d0bb5cfaefb6d4fedfd147fc3e27f3a7afd8d8dac8c94a227";

  it("demo/family.css is the family's, unchanged", () => {
    const css = readFileSync("demo/family.css", "utf8");
    const first = css.indexOf("\n");
    expect(css.slice(0, first)).toBe(`/* sha256 of every line after this one: ${FAMILY_CSS} */`);
    expect(createHash("sha256").update(css.slice(first + 1)).digest("hex")).toBe(FAMILY_CSS);
  });

  it("Tenka's own stylesheet leaves the family's colours and type alone", () => {
    const own = readFileSync("demo/tenka.css", "utf8");
    for (const name of ["--page", "--ink", "--muted", "--rule", "--surface", "--felt", "--accent", "--font", "--mono"]) expect(own, name).not.toMatch(new RegExp(`${name}\\s*:`));
    expect(own).not.toMatch(/font-family/);
  });
});

describe("the package", () => {
  it("TENKA_VERSION is package.json's, and the changelog has it", () => {
    expect(TENKA_VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toContain(`## [${pkg.version}] - `);
    expect(readme).toContain(`"generator": "tenka ${pkg.version}"`);
  });

  it("needs Node 22 or later, and says so only that way", () => {
    expect(pkg.engines.node).toBe(">=22");
    expect(readme).not.toMatch(/Node 20/);
    expect(readFileSync("CONTRIBUTING.md", "utf8")).not.toMatch(/Node 20/);
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(16);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
    expect(template).toContain(`{ id: "tenka", name: "Tenka", kana: "天下" }`);
  });

  it("has the files a visitor looks for: issue templates, a pull request template, a security policy", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/config.yml", ".github/pull_request_template.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "LICENSE"]) expect(existsSync(file), file).toBe(true);
    expect(readme).toContain("issues/new?template=fix-a-translation.md");
  });

  it("keeps SECURITY.md and CODE_OF_CONDUCT.md equal to the family's master text (the shared .github repository), a copy of which is kept in scripts/community", () => {
    for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) expect(readFileSync(file, "utf8"), file).toBe(readFileSync(`scripts/community/${file}`, "utf8"));
  });

  it("its description and keywords are fit for npm", () => {
    expect(pkg.description.length).toBeLessThanOrEqual(250);
    expect(new Set(pkg.keywords).size).toBe(pkg.keywords.length);
    for (const keyword of pkg.keywords) expect(keyword, keyword).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it("exports name built files, by the import condition and a default that require() reads too, and nothing is left to publishConfig", () => {
    for (const [entry, conditions] of Object.entries(pkg.exports)) {
      expect(Object.keys(conditions), entry).toEqual(["types", "import", "default"]);
      for (const file of Object.values(conditions)) expect(file, entry).toMatch(/^\.\/dist\//);
    }
    expect(pkg.publishConfig.exports).toBeUndefined();
    expect(pkg.dependencies).toBeUndefined();
  });

  it("every export of every entry has a doc comment", () => {
    const entries = ["src/index.ts", "src/ui.ts", "src/react.tsx", "src/shapes.ts", "src/dressing.ts"];
    const program = ts.createProgram(entries, { allowImportingTsExtensions: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, skipLibCheck: true });
    const checker = program.getTypeChecker();
    const bare = [];
    let count = 0;
    for (const entry of entries) {
      for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))) {
        const real = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
        count += 1;
        if (ts.displayPartsToString(real.getDocumentationComment(checker)).trim() === "") bare.push(`${entry}: ${symbol.name}`);
      }
    }
    expect(count).toBeGreaterThan(120);
    expect(bare).toEqual([]);
  }, 30000);
});
