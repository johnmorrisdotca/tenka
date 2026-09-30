// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Tenka's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "tenka";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='%23f3efe4'%3E天%3C/text%3E%3C/svg%3E";

const tries = [
  ["duel", `players: ["You", "Kaze"]`],
  ["pass", `computers: [false, false, false]`],
  ["watch", `computers: [true, true, true]`],
  ["seed", `seed: 2026`],
  ["six", `players: [ …six ], rounds: 60`],
];

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Tenka · world conquest on a map of the real world",
      description: "Play world conquest for two to six against the computer, on a map of the real world: place armies, attack with dice, trade cards, take the world. Free and open source, in English and Japanese.",
      ogTitle: "Tenka world conquest",
      ogDescription: "World conquest for two to six, on a map of the real world.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="tenka.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id })}
      <div class="setup fam-row">
        <span class="fam-label" data-say="players"></span>
        <div class="fam-seg" role="group" data-say-label="players">
          ${[2, 3, 4, 5, 6].map((count) => `<button type="button" data-players="${count}">${count}</button>`).join("")}
        </div>
        <span class="fam-label" data-say="length"></span>
        <div class="fam-seg" role="group" data-say-label="length">
          ${[10, 20, 60].map((rounds) => `<button type="button" data-rounds="${rounds}" data-say="rounds${rounds}"></button>`).join("")}
        </div>
        <button type="button" class="fam-button" data-accent="true" id="new" data-say="newGame"></button>
      </div>
      <div id="table"></div>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul>
          ${tries.map(([name, code]) => `<li><button type="button" data-try="${name}"><code>${code.replace(/"/g, "&quot;")}</code><span data-say="try${name[0].toUpperCase()}${name.slice(1)}"></span></button></li>`).join("\n          ")}
        </ul>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
writeFileSync("site/index.html", page);
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
