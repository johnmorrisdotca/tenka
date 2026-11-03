import { type TenkaStrings, tenkaSay } from "../strings.ts";
import type { TenkaGame } from "../tenka.types.ts";
import { tenkaFromJSON, tenkaToCSV, tenkaToJSON, tenkaToText } from "../tenkaExport.ts";
import { button, node, save } from "./dom.ts";

/**
 * THE RECORD UNDER THE PLAYERS: the moves of the game, saved as JSON, text or
 * CSV, and a saved game read back. Its shell is made once, so that it stays
 * open or shut as the person left it; only its words and lines are drawn again.
 */

type TenkaRecordHost = {
  record: HTMLDetailsElement;
  game: () => TenkaGame;
  words: () => TenkaStrings;
  showRecord: () => boolean;
  note: () => string;
  setNote: (note: string) => void;
  loadGame: (game: TenkaGame) => void;
  render: () => void;
};

/**
 * Fill the record and hand back how to draw its words again.
 * @param host - The record element and the live table it reads.
 * @returns How to draw the record's words again.
 */
export function createTenkaRecord(host: TenkaRecordHost): { renderRecord: () => void } {
  const { record } = host;
  const recordTitle = node("summary", "tk-record-title");
  const recordLines = node("pre", "tk-log");
  recordLines.dataset.testid = "tk-log";
  recordLines.tabIndex = 0;
  const recordButtons = node("div", "tk-row");
  const recordNote = node("p", "tk-note");
  recordNote.dataset.testid = "tk-note";
  recordNote.setAttribute("aria-live", "polite");
  const picker = node("input");
  picker.type = "file";
  picker.accept = ".json,application/json";
  picker.hidden = true;
  picker.dataset.testid = "tk-file";
  const read = (text: string) => {
    const loaded = tenkaFromJSON(text);
    if (loaded === null) {
      host.setNote(host.words().loadBad);
      host.render();
      return;
    }
    host.loadGame(loaded);
    const words = host.words();
    host.setNote(tenkaSay(loaded.moves.length === 1 ? words.loadedOne : words.loaded, { n: loaded.moves.length }));
    host.render();
  };
  picker.addEventListener("change", () => {
    const file = picker.files?.[0];
    picker.value = "";
    if (file === undefined) return;
    void file.text().then(read, () => read(""));
  });
  // Made once, like the views' buttons: only their words change.
  const saveJson = button(
    "",
    () => {
      const game = host.game();
      save(`tenka-${game.seed}.json`, "application/json", tenkaToJSON(game));
    },
    false,
    "tk-save-json",
  );
  const saveText = button(
    "",
    () => {
      const game = host.game();
      save(`tenka-${game.seed}.txt`, "text/plain", tenkaToText(game, host.words()));
    },
    false,
    "tk-save-text",
  );
  const saveCsv = button(
    "",
    () => save(`tenka-${host.game().seed}.csv`, "text/csv", tenkaToCSV(host.game())),
    false,
    "tk-save-csv",
  );
  const load = button("", () => picker.click(), false, "tk-load");
  recordButtons.append(saveJson, saveText, saveCsv, load);
  record.append(recordTitle, recordLines, recordButtons, recordNote, picker);

  function renderRecord() {
    if (!host.showRecord()) return;
    const words = host.words();
    const game = host.game();
    recordTitle.textContent = words.record;
    recordNote.textContent = host.note();
    saveJson.textContent = words.saveJson;
    saveText.textContent = words.saveText;
    saveCsv.textContent = words.saveCsv;
    load.textContent = words.load;
    // Written only while it is open: a long game's record is played again from its seed to be written.
    if (!record.open) return;
    recordLines.textContent =
      game.moves.length === 0 ? `${tenkaToText(game, words)}${words.recordEmpty}\n` : tenkaToText(game, words);
    recordLines.scrollTop = recordLines.scrollHeight;
  }

  record.addEventListener("toggle", () => {
    if (record.open) renderRecord();
  });
  return { renderRecord };
}
