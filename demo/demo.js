// The demo page's own script: a table of Tenka against the computer, set up from the row above it,
// kept on this device between visits, and spoken in the language the header's chooser picks.
/* global familyHelp, familyLanguage */
import { tenkaDailySeed, tenkaFromJSON, tenkaToJSON } from "./dist/index.js";
import { mountTenka } from "./dist/ui.js";

// The page's own words, in the two languages the table speaks. Set as text, never as HTML.
const WORDS = {
  en: {
    pageApi: "API reference",
    pitch: "World conquest for two to six, on a map of the real world. Tap your territories to place armies; to attack or to move, tap where from, then where to.",
    name: "Tenka (天下) is Japanese for all under heaven: the whole realm.",
    nameLink: "About the name",
    players: "Players",
    length: "Length",
    rounds10: "10 rounds",
    rounds20: "20 rounds",
    rounds60: "The whole map",
    map: "Map",
    mapWorld: "The world",
    mapEurope: "Europe",
    newGame: "New game",
    daily: "Today's game",
    share: "Copy link",
    copied: "Copied",
    copyFailed: "Could not copy",
    tagTitle: "As a tag",
    tagText: "The same table in one element, with no framework: Europe, two seats and ten rounds, dealt from a seed. The computer plays Kaze.",
    moreTitle: "Other tables",
    moreText: "You play the first seat and the computer plays the rest. Each of these starts a new game another way, and says what the table was given to do it.",
    tryDuel: "A game for two: a neutral army holds a third of the world and only defends",
    tryPass: "Pass one device round: three people, no computer",
    tryWatch: "Watch three computers play each other",
    trySeed: "The same deal every time: a game from a seed",
    trySix: "Six round the table, to the last player standing",
    foot: "Every deal and die comes from the game's seed. Your game stays on this device. The map is drawn from Natural Earth, which is in the public domain.",
    seats: ["You", "Kaze", "Yama", "Umi", "Sora", "Mori"],
    people: ["Ann", "Ben", "Cho"],
  },
  ja: {
    pageApi: "API（英語）",
    pitch: "実在の世界地図で遊ぶ、2〜6人用の世界征服ゲームです。自分の領土をタップして部隊を置きます。攻撃や移動は、出発する領土、目的の領土の順にタップします。",
    name: "「天下」は、天の下のすべて、つまり世の中全体を表す言葉です。",
    nameLink: "名前について（英語）",
    players: "人数",
    length: "長さ",
    rounds10: "10ラウンド",
    rounds20: "20ラウンド",
    rounds60: "地図全体",
    map: "地図",
    mapWorld: "世界",
    mapEurope: "ヨーロッパ",
    newGame: "新しいゲーム",
    daily: "今日のゲーム",
    share: "リンクをコピー",
    copied: "コピーしました",
    copyFailed: "コピーできませんでした",
    tagTitle: "タグとして",
    tagText: "同じテーブルを、フレームワークなしの一つの要素で。ヨーロッパ、2席、10ラウンドで、シードから配ります。風はコンピューターが担当します。",
    moreTitle: "ほかの遊び方",
    moreText: "あなたが最初の席で、残りの席はコンピューターが担当します。下のボタンは、それぞれ別の設定で新しいゲームを始めます。ボタンには、そのときテーブルに渡す設定が書いてあります。",
    tryDuel: "2人用: 中立の部隊が世界の3分の1を持ち、守るだけです",
    tryPass: "1台の端末を回して遊ぶ: 3人、コンピューターなし",
    tryWatch: "コンピューター3人の対戦を見る",
    trySeed: "毎回同じ配置: シードを指定したゲーム",
    trySix: "6人で、最後の1人になるまで",
    foot: "配置もダイスも、すべてゲームのシードから決まります。ゲームはこの端末にだけ保存されます。地図は Natural Earth（パブリックドメイン）をもとに描いています。",
    seats: ["あなた", "風", "山", "海", "空", "森"],
    people: ["アン", "ベン", "チョウ"],
  },
};

const KEPT = "tenka.page.game";
const query = new URLSearchParams(location.search);
const asked = (name, least, most) => {
  const value = Number(query.get(name));
  return query.has(name) && Number.isInteger(value) && value >= least && value <= most ? value : undefined;
};
const delay = asked("delay", 0, 5000);
// The dice and cards are Korokoro's and Toranpu's (`/dressing`); `?dressing=off` shows the plain ones the table draws by itself.
// A page that cannot load them is left with the plain ones.
const dressing = query.get("dressing") === "off" ? undefined : await import("./dist/dressing.js").then((module) => module.tenkaDressing({ sound: query.get("sound") === "on" })).catch(() => undefined);
const seed = asked("seed", 0, 0xffffffff);

const setUp = { players: asked("players", 2, 6) ?? 3, rounds: [10, 20, 60].includes(asked("rounds", 10, 60)) ? asked("rounds", 10, 60) : 20, map: query.get("map") === "europe" ? "europe" : "world" };
const language = familyLanguage({
  id: "tenka",
  words: WORDS,
  onChange: (lang) => {
    table.setLocale(lang);
    // The table in a tag follows the page's language the same way, by its attribute.
    document.getElementById("tag")?.setAttribute("lang", lang);
    // A game nobody has moved in yet is dealt again, the same deal, with the seats named in the new language.
    const game = table.game();
    if (game.moves.length === 0 && WORDS.en.seats.concat(WORDS.ja.seats).includes(game.players[0])) table.newGame({ players: names(game.players.length), computers, seed: game.seed });
  },
});
document.getElementById("tag")?.setAttribute("lang", language.lang);
const names = (count) => WORDS[language.lang].seats.slice(0, count);

/** What was being played when this device last left, if it is still a game the rules can replay. */
function kept() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEPT) ?? "null");
    const game = saved === null ? null : tenkaFromJSON(JSON.stringify(saved.game));
    if (game === null || !Array.isArray(saved.computers) || saved.computers.length !== game.players.length) return null;
    return { game, computers: saved.computers.map(Boolean) };
  } catch {
    return null;
  }
}

let computers = names(setUp.players).map((_, seat) => seat !== 0);
function keep(game) {
  try {
    localStorage.setItem(KEPT, JSON.stringify({ game: JSON.parse(tenkaToJSON(game)), computers }));
  } catch {
    // A browser that keeps nothing still plays.
  }
}

const table = mountTenka(document.getElementById("table"), {
  players: names(setUp.players),
  rounds: setUp.rounds,
  map: setUp.map,
  seed,
  locale: language.lang,
  computerDelayMs: delay,
  dressing,
  // The family's paper and ink, which follow light and dark on their own.
  theme: { "--tk-ink": "var(--ink)", "--tk-panel": "var(--surface)", "--tk-font": "var(--font)", "--tk-accent": "var(--felt)", "--tk-accent-ink": "var(--felt-ink)" },
  onChange: keep,
});

// The table's view chooser (the world, or one continent) is the package's own; the page words it for the Help switch.
const looks = document.querySelector(".tk-zoom");
if (looks !== null) {
  looks.setAttribute("data-help-en", "Look at the whole map, or zoom in on one continent. It changes only what you see.");
  looks.setAttribute("data-help-ja", "地図全体を見るか、ひとつの大陸に拡大します。見え方だけが変わります。");
  looks.setAttribute("data-help-after", "");
  familyHelp.refresh();
}

/** The row above the table shows the table's own numbers. */
function show() {
  for (const button of document.querySelectorAll("[data-players]")) button.setAttribute("aria-pressed", String(Number(button.dataset.players) === setUp.players));
  for (const button of document.querySelectorAll("[data-rounds]")) button.setAttribute("aria-pressed", String(Number(button.dataset.rounds) === setUp.rounds));
  for (const button of document.querySelectorAll("[data-map]")) button.setAttribute("aria-pressed", String(button.dataset.map === setUp.map));
}

function start(options = {}) {
  const players = options.players ?? names(setUp.players);
  computers = options.computers ?? players.map((_, seat) => seat !== 0);
  setUp.players = players.length;
  setUp.rounds = options.rounds ?? setUp.rounds;
  setUp.map = options.map ?? setUp.map;
  table.newGame({ players, computers, rounds: setUp.rounds, seed: options.seed, map: setUp.map });
  show();
  document.getElementById("table").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

// A game left half way is put back, unless the address asks for a deal of its own.
const before = seed === undefined ? kept() : null;
if (before !== null) {
  computers = before.computers;
  setUp.players = before.game.players.length;
  setUp.rounds = before.game.rounds;
  setUp.map = before.game.map ?? "world";
  table.setGame(before.game, computers);
}
show();

for (const button of document.querySelectorAll("[data-players]")) {
  button.addEventListener("click", () => {
    setUp.players = Number(button.dataset.players);
    show();
  });
}
for (const button of document.querySelectorAll("[data-rounds]")) {
  button.addEventListener("click", () => {
    setUp.rounds = Number(button.dataset.rounds);
    show();
  });
}
for (const button of document.querySelectorAll("[data-map]")) {
  button.addEventListener("click", () => {
    setUp.map = button.dataset.map;
    show();
  });
}
document.getElementById("new").addEventListener("click", () => start());
document.getElementById("daily").addEventListener("click", () => start({ seed: tenkaDailySeed(new Date()) }));

/** Say what a button did for a moment, then say what it is for again. */
function said(button, text) {
  const key = button.dataset.say;
  button.textContent = text;
  button.dataset.said = "true";
  setTimeout(() => {
    button.textContent = WORDS[language.lang][key];
    delete button.dataset.said;
  }, 1500);
}

/** The link that deals the game on the table to whoever opens it: its seed, and the set-up that goes with it. */
function linkOf(game) {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ seed: game.seed, players: game.players.length, rounds: game.rounds, map: game.map ?? "world", lang: language.lang }).toString();
  url.hash = "";
  return url.href;
}
document.getElementById("share").addEventListener("click", async () => {
  const button = document.getElementById("share");
  try {
    await navigator.clipboard.writeText(linkOf(table.game()));
    said(button, WORDS[language.lang].copied);
  } catch {
    said(button, WORDS[language.lang].copyFailed);
  }
});

const TRIES = {
  duel: () => ({ players: names(2) }),
  pass: () => ({ players: WORDS[language.lang].people, computers: [false, false, false] }),
  watch: () => ({ players: names(4).slice(1), computers: [true, true, true] }),
  seed: () => ({ players: names(3), seed: 2026 }),
  six: () => ({ players: names(6), rounds: 60 }),
};
for (const button of document.querySelectorAll("[data-try]")) button.addEventListener("click", () => start(TRIES[button.dataset.try]()));
