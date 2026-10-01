// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Tenka's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
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
      ${familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <div class="setup fam-row">
        <div class="fam-row" data-help-en="How many sit at the table: you and the computers. It takes effect when you press New game." data-help-ja="卓につく人数です（あなたとコンピューター）。「新しいゲーム」を押すと反映されます。">
          <span class="fam-label" data-say="players"></span>
          <div class="fam-seg" role="group" data-say-label="players">
            ${[2, 3, 4, 5, 6].map((count) => `<button type="button" data-players="${count}">${count}</button>`).join("")}
          </div>
        </div>
        <div class="fam-row" data-help-en="How long a game runs: 10 rounds, 20 rounds, or until somebody takes the whole map. It takes effect when you press New game." data-help-ja="ゲームの長さです（10ラウンド、20ラウンド、または地図全体を取るまで）。「新しいゲーム」を押すと反映されます。">
          <span class="fam-label" data-say="length"></span>
          <div class="fam-seg" role="group" data-say-label="length">
            ${[10, 20, 60].map((rounds) => `<button type="button" data-rounds="${rounds}" data-say="rounds${rounds}"></button>`).join("")}
          </div>
        </div>
        <div class="fam-row" data-help-en="Play on the map of the whole world, or on a map of Europe. It takes effect when you press New game." data-help-ja="世界地図か、ヨーロッパの地図で遊びます。「新しいゲーム」を押すと反映されます。">
          <span class="fam-label" data-say="map"></span>
          <div class="fam-seg" role="group" data-say-label="map">
            <button type="button" data-map="world" data-say="mapWorld"></button>
            <button type="button" data-map="europe" data-say="mapEurope"></button>
          </div>
        </div>
        <button type="button" class="fam-button" data-accent="true" id="new" data-say="newGame"></button>
        <button type="button" class="fam-button" id="daily" data-say="daily" data-help-after data-help-en="Start a game from today's seed, the same for everybody in the world today, with the players, length and map chosen above." data-help-ja="今日のシードでゲームを始めます。今日は世界中の誰でも同じシードです。人数・長さ・地図は上で選んだものになります。"></button>
        <button type="button" class="fam-button" id="share" data-say="share" data-help-after data-help-en="Copy a link that deals this game's seed, with its players, length and map, to whoever opens it." data-help-ja="このゲームのシード、人数、長さ、地図で配るリンクをコピーします。開いた人にも同じ配置が配られます。"></button>
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
      <section class="more tag" aria-labelledby="tag-title">
        <h2 id="tag-title" data-say="tagTitle"></h2>
        <p data-say="tagText"></p>
        <tenka-table id="tag" data-testid="tag" players="You, Kaze" rounds="10" map="europe" seed="2026" record="off"></tenka-table>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="dist/element-define.js"></script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
writeFileSync("site/index.html", page);
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Tenka", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
