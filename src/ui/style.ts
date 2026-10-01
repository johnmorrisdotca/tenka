/**
 * The table's own styles, scoped to `.tk-root`, with every colour a CSS
 * variable so a page can wear it in its own colours (set them on the element
 * or any ancestor, or pass them as `theme`). Light and dark follow the
 * reader's system. Everything to be tapped is at least 44px.
 */
export const TENKA_STYLE = `
.tk-root {
  --tk-sea: #b9d3dc; --tk-ink: #1f2320; --tk-panel: #f7f3ea; --tk-line: rgba(20,20,20,.55);
  --tk-border: rgba(10,10,10,.8); --tk-link: #1d3440; --tk-accent: #2f5d4a; --tk-accent-ink: #fff;
  --tk-ring: #111; --tk-ring-target: #fff; --tk-counter-edge: #111; --tk-counter-ink: #fff;
  --tk-attack: #c8463d; --tk-attack-ink: #fff; --tk-defend: #f4efe4; --tk-defend-ink: #1f2320;
  --tk-radius: 10px; --tk-font: system-ui, -apple-system, "Segoe UI", sans-serif;
  display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); color: var(--tk-ink);
  font-family: var(--tk-font); font-size: 15px;
}
@media (prefers-color-scheme: dark) {
  .tk-root { --tk-sea: #22343b; --tk-ink: #ece8dc; --tk-panel: #1d201e; --tk-link: #e8eef0; --tk-accent: #6fb08f; --tk-accent-ink: #10150f; }
}
@media (min-width: 900px) { .tk-root { grid-template-columns: minmax(0, 1fr) 280px; } }
.tk-main { display: grid; gap: 10px; min-width: 0; }
.tk-status { margin: 0; min-height: 4.2em; line-height: 1.4; }
@media (min-width: 600px) { .tk-status { min-height: 2.8em; } }
.tk-zoom { display: flex; flex-wrap: wrap; gap: 6px; }
.tk-zoom .tk-button { padding: 0 12px; font-size: 13px; }
.tk-zoom [aria-pressed="true"] { background: var(--tk-accent); color: var(--tk-accent-ink); border-color: transparent; }
.tk-board { border-radius: var(--tk-radius); overflow: hidden; line-height: 0; background: var(--tk-sea); }
.tk-map { width: 100%; height: auto; display: block; cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.tk-sea { fill: var(--tk-sea); }
.tk-land { fill-opacity: .82; stroke: var(--tk-line); stroke-width: 1.2; }
.tk-land:hover { fill-opacity: 1; }
.tk-land:focus { outline: none; }
.tk-land:focus-visible { fill-opacity: 1; stroke: var(--tk-accent); stroke-width: 4; }
.tk-borders { stroke: var(--tk-border); stroke-width: 3; stroke-linecap: round; pointer-events: none; }
.tk-sea-link { stroke: var(--tk-link); stroke-width: 2; stroke-dasharray: 8 6; pointer-events: none; }
.tk-ring { stroke: var(--tk-ring); }
.tk-ring-target { stroke: var(--tk-ring-target); }
.tk-counter circle { stroke: var(--tk-counter-edge); }
.tk-counter text { font-family: var(--tk-font); font-weight: 700; fill: var(--tk-counter-ink); paint-order: stroke; stroke: rgba(0,0,0,.55); }
.tk-controls { display: flex; flex-wrap: wrap; gap: 8px; min-height: 44px; align-items: center; }
.tk-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.tk-button { font: inherit; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--tk-line); background: var(--tk-panel); color: var(--tk-ink); cursor: pointer; touch-action: manipulation; }
.tk-button:focus-visible, .tk-record-title:focus-visible, .tk-slider:focus-visible, .tk-log:focus-visible { outline: 2px solid var(--tk-accent); outline-offset: 2px; }
.tk-primary { background: var(--tk-accent); color: var(--tk-accent-ink); border-color: transparent; }
.tk-slider { min-height: 44px; min-width: 120px; flex: 1 1 120px; max-width: 280px; accent-color: var(--tk-accent); }
.tk-dice { min-height: 1.6em; }
.tk-roll { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; }
.tk-faces { display: inline-flex; gap: 3px; }
.tk-die { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 5px; font-weight: 700; font-size: 13px; }
.tk-attack .tk-die { background: var(--tk-attack); color: var(--tk-attack-ink); }
.tk-defend .tk-die { background: var(--tk-defend); color: var(--tk-defend-ink); border: 1px solid var(--tk-defend-ink); }
.tk-side, .tk-seats { display: grid; gap: 12px; align-content: start; min-width: 0; }
.tk-players { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.tk-player { display: grid; grid-template-columns: 16px 1fr; column-gap: 8px; padding: 6px 8px; border-radius: 8px; background: var(--tk-panel); }
.tk-to-play { outline: 2px solid var(--tk-accent); }
.tk-out { opacity: .45; text-decoration: line-through; }
.tk-marble { width: 14px; height: 14px; border-radius: 50%; grid-row: span 2; align-self: center; border: 1px solid rgba(0,0,0,.4); }
.tk-name { font-weight: 600; overflow-wrap: anywhere; }
.tk-count { font-size: 12px; opacity: .75; }
.tk-hand { display: flex; flex-wrap: wrap; gap: 6px; }
.tk-hand-title { width: 100%; margin: 0; font-weight: 600; }
.tk-card { padding: 4px 8px; border-radius: 6px; background: var(--tk-panel); border: 1px solid var(--tk-line); font-size: 12px; }
.tk-record { border-radius: 8px; background: var(--tk-panel); padding: 0 10px; min-width: 0; }
.tk-record[open] { padding-bottom: 10px; }
.tk-record-title { min-height: 44px; display: flex; align-items: center; font-weight: 600; cursor: pointer; }
.tk-log { margin: 0 0 10px; padding: 0; border: 0; background: transparent; max-height: 240px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.tk-note { margin: 8px 0 0; min-height: 1.4em; font-size: 13px; }
`;
