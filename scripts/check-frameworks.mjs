// Proves the claim in the README: the packed package works in React, Vue, Svelte, Angular and a
// plain page, with nothing for the consumer to configure. The code it builds is the README's own:
// each example under "Use it in your project" is lifted from the page as it is written, so what a
// reader copies is what was proved. It packs the package, makes a small project for each in a
// scratch folder, installs the tarball and each framework's own tools there (never here: the
// package has no dependencies), and builds it. With TENKA_BROWSER=1 it
// also opens each built page in Chromium and WebKit and plays a move by tapping the map.
//
//   pnpm build && TENKA_BROWSER=1 node scripts/check-frameworks.mjs [scratch folder]
//
// Run it before a release that names a framework. It needs the network and a few minutes.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import process from "node:process";

const root = resolve(process.argv[2] ?? mkdtempSync(join(tmpdir(), "tenka-frameworks-")));
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const run = (cwd, command, args) => execFileSync(command, args, { cwd, stdio: "pipe", shell: process.platform === "win32", env: { ...process.env, NG_CLI_ANALYTICS: "false" } }).toString();
const write = (dir, files) => {
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), typeof text === "string" ? text : JSON.stringify(text, null, 2));
  }
};

run(process.cwd(), "npm", ["pack", "--ignore-scripts", "--pack-destination", root]);
const tarball = join(root, readdirSync(root).find((name) => name.endsWith(".tgz")));
const tenka = `file:${tarball}`;
const page = (script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>tenka</title></head><body><div id="app"></div>${script}</body></html>`;
// The README's examples, by the heading each stands under.
const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
function example(heading, lang) {
  const from = readme.indexOf(heading);
  const found = from < 0 ? null : new RegExp("^```" + lang + "\\n([\\s\\S]*?)^```$", "m").exec(readme.slice(from));
  if (found === null) throw new Error(`the README has no ${lang} example under “${heading}”`);
  return found[1];
}
// A page with no bundler imports the published files by their path.
const unbundled = (code) =>
  code
    .replaceAll('"@johnmorrisdotca/tenka/ui"', '"./tenka/dist/ui.js"')
    .replaceAll('"@johnmorrisdotca/tenka"', '"./tenka/dist/index.js"')
    .replaceAll("https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@1/dist/element-define.js", "./tenka/dist/element-define.js");

const projects = {
  // The table in a component's mount hook, which is all any framework needs.
  vue: {
    out: "dist",
    files: {
      "package.json": { name: "check-vue", private: true, type: "module", dependencies: { "@johnmorrisdotca/tenka": tenka, vue: "^3.5.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-vue": "^6.0.0" } },
      "vite.config.js": `import vue from "@vitejs/plugin-vue";\nexport default { base: "./", plugins: [vue()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { createApp } from "vue";\nimport App from "./App.vue";\ncreateApp(App).mount("#app");\n`,
      "src/App.vue": example("### 5. Vue", "vue"),
    },
  },
  svelte: {
    out: "dist",
    files: {
      "package.json": { name: "check-svelte", private: true, type: "module", dependencies: { "@johnmorrisdotca/tenka": tenka, svelte: "^5.0.0" }, devDependencies: { vite: "^7.0.0", "@sveltejs/vite-plugin-svelte": "^6.0.0" } },
      "vite.config.js": `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { base: "./", plugins: [svelte()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { mount } from "svelte";\nimport App from "./App.svelte";\nmount(App, { target: document.getElementById("app") });\n`,
      "src/App.svelte": example("### 6. Svelte", "svelte"),
    },
  },
  angular: {
    out: "dist/check-angular/browser",
    files: {
      "package.json": {
        name: "check-angular",
        private: true,
        dependencies: { "@johnmorrisdotca/tenka": tenka, "@angular/common": "^20.0.0", "@angular/compiler": "^20.0.0", "@angular/core": "^20.0.0", "@angular/platform-browser": "^20.0.0", rxjs: "^7.8.0", tslib: "^2.8.0" },
        devDependencies: { "@angular/build": "^20.0.0", "@angular/cli": "^20.0.0", "@angular/compiler-cli": "^20.0.0", typescript: "~5.8.0" },
      },
      "angular.json": {
        version: 1,
        projects: {
          "check-angular": {
            projectType: "application",
            root: "",
            sourceRoot: "src",
            architect: { build: { builder: "@angular/build:application", options: { outputPath: "dist/check-angular", index: "src/index.html", browser: "src/main.ts", tsConfig: "tsconfig.json", baseHref: "./" }, configurations: { production: {} }, defaultConfiguration: "production" } },
          },
        },
      },
      "tsconfig.json": { compilerOptions: { target: "ES2022", module: "ES2022", moduleResolution: "bundler", strict: true, experimentalDecorators: true, skipLibCheck: true, lib: ["ES2022", "dom"] }, files: ["src/main.ts"] },
      "src/index.html": page(`<app-root></app-root>`),
      "src/main.ts": example("### 7. Angular", "typescript"),
    },
  },
  // The table as a component, and the map alone under a board of the page's own.
  react: {
    out: "dist",
    maps: 2,
    files: {
      "package.json": { name: "check-react", private: true, type: "module", dependencies: { "@johnmorrisdotca/tenka": tenka, react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-react": "^5.0.0" } },
      "vite.config.js": `import react from "@vitejs/plugin-react";\nexport default { base: "./", plugins: [react()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.jsx"></script>`),
      "src/App.jsx": example("### 4. React", "jsx"),
      "src/Board.jsx": example("### The React components", "jsx"),
      "src/main.jsx": `import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { Board } from "./Board.jsx";

createRoot(document.getElementById("app")).render(
  <>
    <App />
    <div id="board"><Board /></div>
  </>,
);
`,
    },
  },
  // No framework and no bundler: a script tag and the files as they are published.
  plain: {
    out: ".",
    build: (dir) => {
      run(dir, "npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts"]);
      cpSync(join(dir, "node_modules/@johnmorrisdotca/tenka"), join(dir, "tenka"), { recursive: true, dereference: true });
      rmSync(join(dir, "node_modules"), { recursive: true, force: true });
    },
    also: ["quick.html", "themed.html", "tag.html"],
    files: {
      "package.json": { name: "check-plain", private: true, dependencies: { "@johnmorrisdotca/tenka": tenka } },
      "index.html": page(unbundled(example("### 2. The table, in plain HTML", "html"))),
      // The two other examples that mount a table: the one in "Play in 30 seconds", and the themed one.
      "quick.html": page(`<div id="table"></div><script type="module">${unbundled(example("## Play in 30 seconds", "js"))}</script>`),
      "themed.html": page(`<div id="table"></div><script type="module">${unbundled(example("## Theming", "js"))}</script>`),
      // The tag, as the README writes it: two tables on one page, with no script of the page's own.
      "tag.html": page(unbundled(example("### 3. As a tag", "html"))),
    },
  },
};

const only = process.env.TENKA_FRAMEWORKS?.split(",");
const built = [];
for (const [name, project] of Object.entries(projects)) {
  if (only !== undefined && !only.includes(name)) continue;
  const dir = join(root, name);
  write(dir, project.files);
  const started = Date.now();
  try {
    if (project.build !== undefined) project.build(dir);
    else {
      run(dir, "npm", ["install", "--no-audit", "--no-fund"]);
      run(dir, "npx", name === "angular" ? ["ng", "build"] : ["vite", "build"]);
    }
    if (!existsSync(join(dir, project.out, "index.html"))) throw new Error(`no index.html in ${project.out}`);
    built.push([name, join(dir, project.out), project]);
    console.log(`built   ${name.padEnd(8)} in ${Math.round((Date.now() - started) / 1000)} s`);
  } catch (error) {
    console.log(`FAILED  ${name}: ${String(error.stderr ?? error.stdout ?? error.message).split("\n").slice(-12).join("\n")}`);
    process.exitCode = 1;
  }
}

// Open each built page in a browser and play: the table has to mount, the computer has to take its
// turns, and a tap on one of your own territories has to place an army and hand the game back.
if (process.env.TENKA_BROWSER !== undefined) {
  const { chromium, webkit } = createRequire(import.meta.url)(process.env.TENKA_BROWSER === "1" ? "@playwright/test" : process.env.TENKA_BROWSER);
  const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
  for (const [engine, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
    const browser = await launcher.launch();
    for (const [name, out, project] of built) {
      const context = await browser.newContext({ viewport: { width: 390, height: 800 } });
      const tab = await context.newPage();
      const errors = [];
      tab.on("pageerror", (error) => errors.push(String(error)));
      await tab.route("http://check.test/**", (route) => {
        let file = join(out, decodeURIComponent(new URL(route.request().url()).pathname));
        if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
        if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
        return route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? "application/octet-stream" });
      });
      await tab.goto("http://check.test/");
      // The computer plays until it is the first seat's turn to place armies.
      await tab.waitForSelector('[data-testid="tk-root"][data-waiting="true"][data-phase="reinforce"]', { timeout: 120000 });
      const before = Number(await tab.locator("#moves").textContent());
      const mine = tab.locator('[data-testid="tk-root"] .tk-land[data-owner="0"]').first();
      const territory = await mine.getAttribute("data-territory");
      const armies = Number(await mine.getAttribute("data-armies"));
      await tab.locator(`[data-testid="tk-root"] .tk-counter[data-territory="${territory}"]`).click();
      await tab.waitForFunction((was) => Number(document.getElementById("moves").textContent) === was + 1, before, { timeout: 5000 });
      const after = Number(await tab.locator(`[data-testid="tk-root"] .tk-land[data-territory="${territory}"]`).getAttribute("data-armies"));
      const lands = await tab.locator('[data-testid="tk-root"] .tk-land').count();
      // The map alone, where a project draws one beside the table.
      const maps = await tab.locator("svg").count();
      const notes = [];
      // The pages that only mount a table: it has to come up, and wear what it was given.
      for (const other of project.also ?? []) {
        await tab.goto(`http://check.test/${other}`);
        await tab.waitForSelector('[data-testid="tk-root"] .tk-land');
        const sea = await tab.locator('[data-testid="tk-root"]').first().evaluate((el) => el.style.getPropertyValue("--tk-sea"));
        notes.push(`${other} mounted${sea === "" ? "" : ` with the sea ${sea}`}`);
        if (other === "themed.html" && sea !== "#16283a") errors.push("the theme was not set on the table");
        if (other === "tag.html") {
          const tables = await tab.locator('tenka-table [data-testid="tk-root"]').count();
          const worlds = await tab.locator('tenka-table .tk-land').count();
          if (tables !== 2 || worlds !== 42 + 37) errors.push(`the tags drew ${tables} tables and ${worlds} territories, not two tables of 42 and 37`);
        }
      }
      const ok = errors.length === 0 && after === armies + 1 && lands === 42 && maps === (project.maps ?? 1);
      console.log(`${ok ? "played " : "FAILED "} ${name.padEnd(8)} in ${engine}: ${lands} territories drawn, a tap took territory ${territory} from ${armies} armies to ${after}, the game handed back at move ${before + 1}${notes.map((note) => `; ${note}`).join("")}${errors.length > 0 ? ` ${errors.join("; ")}` : ""}`);
      if (!ok) process.exitCode = 1;
      await context.close();
    }
    await browser.close();
  }
}
console.log(`scratch projects are in ${root}`);
