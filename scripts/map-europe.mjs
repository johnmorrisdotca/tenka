/**
 * Builds Tenka's Europe: forty-nine territories in eleven regions, drawn from
 * Natural Earth's provinces and written into two small static files.
 *
 *   node scripts/map-europe.mjs        (or: pnpm map europe)
 *
 * THE MAP IS A GRAPH FIRST. `scripts/europe-edges.mjs` is the list of which
 * territories there are, which touch and which are joined across the water —
 * equal, as a graph, to the classic Europe board's (John, 2026-10-02: "why
 * would I want a Risk clone that is different?"). This script draws the
 * territories out of real geography so that they have exactly those borders,
 * and REFUSES TO WRITE if the borders it drew are not the list's.
 *
 * SOURCE AND LICENCE. Natural Earth's admin-1 states and provinces at 1:10m
 * (naturalearthdata.com). Natural Earth is in the public domain: "No
 * permission is needed to use Natural Earth. Crediting the authors is
 * unnecessary." It is fetched here, at build time, from the project's own
 * repository on GitHub and cached in the machine's temporary folder (or read
 * from `TENKA_EUROPE_SOURCE` when that names a copy); the site never fetches
 * anything from anywhere to draw the map. The first-level units are given to
 * territories in `scripts/europe-units.mjs`.
 *
 * WHAT IT DOES, in order:
 *
 *  1. Every unit's polygons are given to a territory (`territoryOf`), a few
 *     units split along a straight line (`CUTS`), everything outside the frame
 *     clipped off, and small islands a finger could never find left off.
 *  2. Everything is projected on Miller's cylindrical projection, whole map
 *     units, and each territory's units are MERGED into one outline: an edge
 *     two of its own units share is dropped, and what is left is joined up into
 *     rings. Two territories are neighbours by land when they share an edge.
 *  3. The borders found are compared with `EUROPE_LAND_EDGES`; any difference
 *     stops the script and is named.
 *  4. Written out: `src/tenkaEurope.data.ts` (names, regions, land and sea
 *     neighbours — what the rules read) and `src/tenkaEuropeShapes.data.ts`
 *     (outlines as SVG paths, counters, extents, the sea routes' dashed lines
 *     and the regions' borders — what only the browser's board draws).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { EUROPE_LAND_EDGES, EUROPE_REGION_KEYS, EUROPE_SEA_EDGES, EUROPE_TERRITORY_LIST } from "./europe-edges.mjs";
import { COUNTRIES, CUTS, FRAME, territoryOf } from "./europe-units.mjs";

const REMOTE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const CACHE = process.env.TENKA_EUROPE_SOURCE ?? join(tmpdir(), "ne_10m_admin_1_states_provinces.geojson");
const DATA_OUT = "src/tenkaEurope.data.ts";
const SHAPES_OUT = "src/tenkaEuropeShapes.data.ts";

/** The map's width in its own units; coordinates are whole units. */
const WIDTH = 2000;
/** The least an island's outline may enclose, in square map units, to be drawn: about six pixels square at a whole-Europe view. */
const LEAST_AREA = 40;
/** The least a sea route's dashed line is drawn, in map units: long enough to read as a crossing, not a dash. */
const LEAST_CROSSING = 64;
/** How far a drawn outline may stray from its rounded points, in map units, when its points are thinned out. */
const THINNING = Number(process.env.TENKA_THIN ?? 1.2);

/**
 * Where a territory's army counter stands, by hand, in longitude and latitude, where the point of its largest piece
 * furthest from any edge (where the rest stand) would sit badly.
 */
const LABELS = {
  denmark: [9.5, 56.2],
  sweden: [15.6, 61.2],
  // Navarre and Barcelona lie side by side across the Pyrenees' eastern end: their middles are 76 units apart, two counters apart and no more.
  navarre: [-1.6, 42.0],
  barcelona: [1.9, 41.95],
};

/**
 * How each sea route is drawn, by the two territories' keys: from a point on one coast to a point on the other (longitude
 * and latitude), as the route runs on the board. A line shorter than `LEAST_CROSSING` is lengthened about its middle.
 */
const SEA_DRAWN = {
  "scotland-norway": { from: [-3.2, 58.7], to: [5.0, 60.3] },
  "scotland-ireland": { from: [-5.5, 55.4], to: [-6.2, 54.7] },
  "ireland-wales": { from: [-6.1, 52.6], to: [-4.4, 52.2] },
  "ireland-brittany": { from: [-7.4, 51.7], to: [-4.9, 48.6] },
  "england-normandy": { from: [-1.3, 50.75], to: [-0.9, 49.3] },
  "england-lorraine": { from: [1.1, 51.5], to: [2.9, 51.25] },
  "norway-denmark": { from: [7.6, 58.0], to: [10.0, 57.4] },
  "denmark-sweden": { from: [10.4, 56.5], to: [12.6, 56.7] },
  "pomerania-lithuania": { from: [17.2, 54.75], to: [21.0, 56.5] },
  "finland-estonia": { from: [24.9, 60.1], to: [24.6, 59.5] },
  "finland-novgorod": { from: [30.3, 64.5], to: [36.9, 64.6] },
  "brittany-leonCastile": { from: [-3.6, 47.2], to: [-5.8, 43.7] },
  "leonCastile-morocco": { from: [-6.3, 36.4], to: [-6.9, 34.2] },
  "valencia-algeria": { from: [-0.6, 38.0], to: [0.0, 36.0] },
  "barcelona-burgundy": { from: [3.1, 41.8], to: [4.9, 43.3] },
  "sardinia-rome": { from: [9.8, 41.1], to: [11.8, 41.9] },
  "sardinia-tunisia": { from: [8.8, 38.9], to: [10.2, 37.2] },
  "venice-kingdomOfSicily": { from: [16.0, 43.2], to: [16.0, 41.9] },
  "tunisia-greece": { from: [11.0, 34.5], to: [21.3, 37.0] },
};

// ——— Geometry ———

const RAD = Math.PI / 180;
const miller = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * RAD));
const SCALE = WIDTH / ((FRAME.east - FRAME.west) * RAD);
const TOP = miller(FRAME.north);
const HEIGHT = Math.round((TOP - miller(FRAME.south)) * SCALE);
const project = ([lon, lat]) => [Math.round((lon - FRAME.west) * RAD * SCALE), Math.round((TOP - miller(lat)) * SCALE)];

/** A ring's signed area by the shoelace formula (in whatever units its points are). */
function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

/** A ring without its closing point, which GeoJSON repeats. */
const open = (ring) => (ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring);

/** Which side of a directed line a point lies: positive to its left, negative to its right. */
const sideOf = ([[px, py], [qx, qy]], [x, y]) => (qx - px) * (y - py) - (qy - py) * (x - px);

/**
 * Where a ring's edge crosses a line, worked out the same way whichever end the edge is walked from, so that the two
 * units either side of a border get exactly the same new point, and keep sharing the edge.
 */
function crossing(a, b, line) {
  const [p, q] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a];
  const sp = sideOf(line, p);
  const sq = sideOf(line, q);
  const t = sp / (sp - sq);
  return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
}

/** How far along a line's two points a point on it lies: 0 at the first, 1 at the second. */
const alongOf = ([[px, py], [qx, qy]], [x, y]) => ((x - px) * (qx - px) + (y - py) * (qy - py)) / ((qx - px) ** 2 + (qy - py) ** 2);

/**
 * A ring with a point added wherever it crosses one of the lines between the line's two points, so that the neighbours
 * of a cut unit are cut at the same place. A line is drawn long enough to run clear across every unit it cuts.
 */
function withCrossings(ring, lines) {
  const out = [];
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    const hits = [];
    for (const line of lines) {
      if (sideOf(line, a) > 0 === sideOf(line, b) > 0) continue;
      const point = crossing(a, b, line);
      const u = alongOf(line, point);
      if (u >= 0 && u <= 1) hits.push(point);
    }
    // Along the edge from a to b, nearest first.
    hits.sort((m, n) => Math.hypot(m[0] - a[0], m[1] - a[1]) - Math.hypot(n[0] - a[0], n[1] - a[1]));
    out.push(...hits);
  }
  return out;
}

/**
 * A ring split along a directed line into the rings lying to its left and to its right. The ring may cross the line
 * any even number of times: each stretch of ring on one side is closed up along the line to the next, the way the
 * inside of the ring lies there.
 */
function splitRing(ring, line) {
  const sides = ring.map((point) => sideOf(line, point) > 0);
  const events = [];
  for (let i = 0; i < ring.length; i += 1) {
    const j = (i + 1) % ring.length;
    if (sides[i] !== sides[j]) {
      const point = crossing(ring[i], ring[j], line);
      events.push({ at: i, point, toLeft: sides[j], along: (point[0] - line[0][0]) * (line[1][0] - line[0][0]) + (point[1] - line[0][1]) * (line[1][1] - line[0][1]) });
    }
  }
  if (events.length === 0) return sides[0] ? { left: [ring], right: [] } : { left: [], right: [ring] };
  // The crossings in order along the line pair up: each pair bounds a stretch of the line inside the ring.
  const ordered = [...events].sort((m, n) => m.along - n.along);
  const mate = new Map();
  for (let i = 0; i + 1 < ordered.length; i += 2) {
    mate.set(ordered[i], ordered[i + 1]);
    mate.set(ordered[i + 1], ordered[i]);
  }
  const rings = { left: [], right: [] };
  for (const wantLeft of [true, false]) {
    const starts = events.filter((event) => event.toLeft === wantLeft);
    const used = new Set();
    for (const first of starts) {
      if (used.has(first)) continue;
      const out = [];
      let start = first;
      while (!used.has(start)) {
        used.add(start);
        out.push(start.point);
        // Walk the ring from this crossing until it crosses back.
        const index = events.indexOf(start);
        const end = events[(index + 1) % events.length];
        let at = (start.at + 1) % ring.length;
        while (true) {
          out.push(ring[at]);
          if (at === end.at) break;
          at = (at + 1) % ring.length;
        }
        out.push(end.point);
        start = mate.get(end);
      }
      if (out.length >= 3) rings[wantLeft ? "left" : "right"].push(out);
    }
  }
  return rings;
}

/** A ring clipped to the frame: the part inside, as rings. */
function clipToFrame(ring) {
  // Each directed line has the inside of the frame on its left.
  const inside = [
    [[FRAME.west, 90], [FRAME.west, -90]],
    [[FRAME.east, -90], [FRAME.east, 90]],
    [[180, FRAME.north], [-180, FRAME.north]],
    [[-180, FRAME.south], [180, FRAME.south]],
  ];
  let rings = [ring];
  for (const line of inside) rings = rings.flatMap((one) => splitRing(one, line).left);
  return rings;
}

// ——— Reading the source ———

async function source() {
  if (existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, "utf8"));
  const response = await fetch(REMOTE);
  if (!response.ok) throw new Error(`Could not fetch ${REMOTE}: ${response.status}`);
  const text = await response.text();
  writeFileSync(CACHE, text);
  return JSON.parse(text);
}

/** The lines every ring is given crossing points for, so that neighbours of a cut unit are cut where it is. */
const CUT_LINES = Object.values(CUTS).map((cut) => cut.line);

/** Every unit's polygons given to their territories: pieces of outer ring and holes, in longitude and latitude. */
function assign(features) {
  const byTerritory = new Map(EUROPE_TERRITORY_LIST.map((territory) => [territory.key, []]));
  const counts = new Map();
  for (const feature of features) {
    const p = feature.properties;
    if (!COUNTRIES.has(p.adm0_a3)) continue;
    const answer = territoryOf(p.adm0_a3, p.name, p.region ?? "", p.gu_a3 ?? "");
    if (answer === undefined || answer === null) continue;
    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    const largest = Math.max(...polygons.map((polygon) => Math.abs(ringArea(polygon[0]))));
    for (const polygon of polygons) {
      // A unit that is cut is cut at the very points its neighbours are given; the rest are given the points.
      const rings = polygon.map((ring) => (typeof answer === "string" ? withCrossings(open(ring), CUT_LINES) : open(ring)));
      const main = Math.abs(ringArea(polygon[0])) === largest;
      const [outer, ...holes] = rings;
      // Every territory this polygon contributes to, with the piece of outer ring it contributes.
      let pieces;
      if (typeof answer === "string") pieces = [[answer, outer]];
      else {
        const cut = CUTS[answer.cut];
        const halves = splitRing(outer, cut.line);
        pieces = [...halves.left.map((ring) => [cut.left, ring]), ...halves.right.map((ring) => [cut.right, ring])];
      }
      for (const [key, piece] of pieces) {
        if (key === null) continue;
        for (const inFrame of clipToFrame(piece)) {
          byTerritory.get(key).push({ unit: `${p.adm0_a3}/${p.name}`, main, rings: [inFrame, ...holes.filter((hole) => hole.every(([lon, lat]) => lon > FRAME.west && lon < FRAME.east && lat > FRAME.south && lat < FRAME.north))] });
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }
  }
  return { byTerritory, counts };
}

// ——— Merging a territory's units into one outline ———

const keyOf = ([x, y]) => `${x},${y}`;

/** A ring in map units: projected, rounded, with repeated points and there-and-back spikes taken out. */
function projectRing(ring) {
  const points = [];
  for (const point of ring.map(project)) {
    const last = points.at(-1);
    if (last !== undefined && last[0] === point[0] && last[1] === point[1]) continue;
    points.push(point);
  }
  while (points.length > 1 && keyOf(points[0]) === keyOf(points.at(-1))) points.pop();
  let changed = true;
  while (changed && points.length >= 3) {
    changed = false;
    for (let i = 0; i < points.length; i += 1) {
      const before = points[(i - 1 + points.length) % points.length];
      const after = points[(i + 1) % points.length];
      if (keyOf(before) === keyOf(after)) {
        points.splice(i, 1);
        points.splice(i % points.length, 1);
        changed = true;
        break;
      }
    }
  }
  return points;
}

/** Every directed edge of a territory's rings. */
function edgesOf(rings) {
  const edges = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 1) edges.push([ring[i], ring[(i + 1) % ring.length]]);
  }
  return edges;
}

/** Rings orientated alike: an outer ring one way, a hole the other, so that a shared edge is walked in opposite directions. */
function orientated(polygonRings) {
  return polygonRings.map((ring, index) => {
    const positive = ringArea(ring) > 0;
    const wantPositive = index === 0;
    return positive === wantPositive ? ring : [...ring].reverse();
  });
}

/** A territory's outline: its edges with every edge its own pieces share dropped, joined back into rings. */
function mergeOutline(pieces) {
  const all = [];
  for (const piece of pieces) {
    const rings = orientated(piece.rings.map(projectRing).filter((ring) => ring.length >= 3));
    if (rings.length === 0) continue;
    if (!piece.main && Math.abs(ringArea(rings[0])) < LEAST_AREA) continue;
    all.push(...edgesOf(rings));
  }
  // An edge walked one way cancels one walked the other way: what is left of the two is walked as often as it was more.
  const counts = new Map();
  for (const [a, b] of all) counts.set(`${keyOf(a)}>${keyOf(b)}`, (counts.get(`${keyOf(a)}>${keyOf(b)}`) ?? 0) + 1);
  const seen = new Set();
  const kept = [];
  for (const [a, b] of all) {
    const key = `${keyOf(a)}>${keyOf(b)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (let copies = counts.get(key) - (counts.get(`${keyOf(b)}>${keyOf(a)}`) ?? 0); copies > 0; copies -= 1) kept.push([a, b]);
  }
  // Join the edges left into rings, following each edge on from the point it ends at. The inside of a territory is on
  // the left of every edge, so where several edges leave a point the one turning furthest left is taken, which keeps
  // two parts that touch at a point apart.
  const from = new Map();
  for (const edge of kept) {
    const key = keyOf(edge[0]);
    if (!from.has(key)) from.set(key, []);
    from.get(key).push(edge);
  }
  const turn = (into, edge) => Math.atan2((into[1][0] - into[0][0]) * (edge[1][1] - edge[0][1]) - (into[1][1] - into[0][1]) * (edge[1][0] - edge[0][0]), (into[1][0] - into[0][0]) * (edge[1][0] - edge[0][0]) + (into[1][1] - into[0][1]) * (edge[1][1] - edge[0][1]));
  const used = new Set();
  const rings = [];
  for (const edge of kept) {
    if (used.has(edge)) continue;
    const ring = [];
    let at = edge;
    while (at !== undefined && !used.has(at)) {
      used.add(at);
      ring.push(at[0]);
      const options = (from.get(keyOf(at[1])) ?? []).filter((next) => !used.has(next));
      const into = at;
      at = options.reduce((best, next) => (best === undefined || turn(into, next) > turn(into, best) ? next : best), undefined);
    }
    if (ring.length >= 3) rings.push(ring);
  }
  return { rings, edges: kept };
}

/** An open line of points thinned by Douglas and Peucker, keeping its first point and leaving its last to the caller. */
function thin(points) {
  if (points.length < 3) return points.slice(0, -1);
  const [ax, ay] = points[0];
  const [bx, by] = points.at(-1);
  const length = Math.hypot(bx - ax, by - ay) || 1;
  let worst = -1;
  let at = -1;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const off = Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / length;
    if (off > worst) {
      worst = off;
      at = i;
    }
  }
  return worst > THINNING ? [...thin(points.slice(0, at + 1)), ...thin(points.slice(at))] : [points[0]];
}

/** A whole line of points thinned, both ends kept. */
const thinLine = (points) => [...thin(points), points.at(-1)];

/**
 * A territory's rings thinned so that its borders stay borders: a ring is cut into stretches where it borders the same
 * neighbour (or the sea), each stretch is thinned with its ends held, and a border is thinned the same way from either
 * side (walked from its lesser end), so that two territories sharing it still share it exactly.
 */
function thinnedRings(at) {
  return outlines[at].rings.map((ring) => {
    const n = ring.length;
    if (n < 8) return ring;
    const tag = ring.map((point, i) => edgeOwner.get(`${keyOf(ring[(i + 1) % n])}>${keyOf(point)}`) ?? -1);
    const start = tag.findIndex((t, i) => t !== tag[(i - 1 + n) % n]);
    if (start === -1) {
      const far = ring.reduce((best, point, i) => (Math.hypot(point[0] - ring[0][0], point[1] - ring[0][1]) > Math.hypot(ring[best][0] - ring[0][0], ring[best][1] - ring[0][1]) ? i : best), 0);
      const out = [...thin(ring.slice(0, far + 1)), ...thin([...ring.slice(far), ring[0]])];
      return out.length >= 3 ? out : ring;
    }
    const out = [];
    let i = start;
    let done = 0;
    while (done < n) {
      const t = tag[i];
      const chain = [ring[i]];
      let j = i;
      while (done < n && tag[j] === t) {
        j = (j + 1) % n;
        chain.push(ring[j]);
        done += 1;
      }
      const forward = t === -1 || keyOf(chain[0]) <= keyOf(chain.at(-1));
      const thinnedChain = thinLine(forward ? chain : [...chain].reverse());
      out.push(...(forward ? thinnedChain : thinnedChain.reverse()).slice(0, -1));
      i = j;
    }
    return out.length >= 3 ? out : ring;
  });
}

/** A ring as a compact SVG path: the first point absolute, every other relative, whole units. */
function pathOf(rings) {
  return rings
    .map((ring) => {
      let d = `M${ring[0][0]} ${ring[0][1]}l`;
      const parts = [];
      for (let i = 1; i < ring.length; i += 1) parts.push(`${ring[i][0] - ring[i - 1][0]} ${ring[i][1] - ring[i - 1][1]}`);
      d += parts.join(" ").replace(/ -/g, "-");
      return `${d}z`;
    })
    .join("");
}

function inside([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function distanceToEdges(point, rings) {
  let least = Infinity;
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 1) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % ring.length];
      const dx = bx - ax;
      const dy = by - ay;
      const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((point[0] - ax) * dx + (point[1] - ay) * dy) / (dx * dx + dy * dy)));
      least = Math.min(least, Math.hypot(point[0] - (ax + t * dx), point[1] - (ay + t * dy)));
    }
  }
  return least;
}

/** Where a territory's army counter stands: the point of its largest piece furthest from any edge, found on a fine grid. */
function labelOf(rings) {
  const largest = rings.reduce((best, ring) => (Math.abs(ringArea(ring)) > Math.abs(ringArea(best)) ? ring : best));
  const xs = largest.map(([x]) => x);
  const ys = largest.map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const step = Math.max(1, Math.min(x1 - x0, y1 - y0) / 40);
  let best = [Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2)];
  let bestDistance = -1;
  for (let x = x0; x <= x1; x += step) {
    for (let y = y0; y <= y1; y += step) {
      if (!inside([x, y], largest)) continue;
      const distance = distanceToEdges([x, y], [largest]);
      if (distance > bestDistance) {
        bestDistance = distance;
        best = [Math.round(x), Math.round(y)];
      }
    }
  }
  return best;
}

/** A crossing drawn across the strait, lengthened about its middle to at least `LEAST_CROSSING`, toward `towards` where its two ends touch. */
function crossingLine(p, q, towards) {
  let [dx, dy] = [q[0] - p[0], q[1] - p[1]];
  let length = Math.hypot(dx, dy);
  if (length === 0) {
    [dx, dy] = [towards[0] - p[0], towards[1] - p[1]];
    length = Math.hypot(dx, dy) || 1;
  }
  const half = Math.max(length, LEAST_CROSSING) / 2;
  const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const [ux, uy] = [dx / length, dy / length];
  return [mx - ux * half, my - uy * half, mx + ux * half, my + uy * half].map(Math.round);
}

// ——— Build ———

const features = (await source()).features;
const { byTerritory, counts } = assign(features);
const TERRITORIES = EUROPE_TERRITORY_LIST;
const outlines = TERRITORIES.map((territory) => {
  if (!EUROPE_REGION_KEYS.includes(territory.continent)) throw new Error(`${territory.key} is in no region the rules know.`);
  const pieces = byTerritory.get(territory.key);
  if (pieces.length === 0) throw new Error(`${territory.key} has no land.`);
  return mergeOutline(pieces);
});

const index = new Map(TERRITORIES.map((territory, at) => [territory.key, at]));
const edgeOwner = new Map();
outlines.forEach((outline, at) => {
  for (const [a, b] of outline.edges) edgeOwner.set(`${keyOf(a)}>${keyOf(b)}`, at);
});
const land = TERRITORIES.map(() => new Set());
const lengths = new Map();
const regionBorders = [];
outlines.forEach((outline, at) => {
  for (const [a, b] of outline.edges) {
    const other = edgeOwner.get(`${keyOf(b)}>${keyOf(a)}`);
    if (other === undefined || other === at) continue;
    land[at].add(other);
    const pair = at < other ? `${at}-${other}` : `${other}-${at}`;
    lengths.set(pair, (lengths.get(pair) ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
    // Each border between two regions once, from the side listed first.
    if (TERRITORIES[at].continent !== TERRITORIES[other].continent && at < other) regionBorders.push([a, b]);
  }
});

// The borders drawn must be the list's, exactly.
const drawn = new Set();
land.forEach((set, at) => {
  for (const other of set) if (at < other) drawn.add(`${TERRITORIES[at].key}|${TERRITORIES[other].key}`);
});
const wanted = new Set(EUROPE_LAND_EDGES.map(([a, b]) => (index.get(a) < index.get(b) ? `${a}|${b}` : `${b}|${a}`)));
const problems = [
  ...[...drawn].filter((pair) => !wanted.has(pair)).map((pair) => `drawn but not in the list: ${pair.replace("|", " – ")} (${(lengths.get(pair.split("|").map((key) => index.get(key)).sort((m, n) => m - n).join("-")) ?? 0).toFixed(1)} units)`),
  ...[...wanted].filter((pair) => !drawn.has(pair)).map((pair) => `in the list but not drawn: ${pair.replace("|", " – ")}`),
];
if (problems.length > 0) {
  console.log(problems.join("\n"));
  console.log(`\n${problems.length} borders differ from scripts/europe-edges.mjs; nothing written.`);
  process.exit(1);
}

const labelFor = (at) => (LABELS[TERRITORIES[at].key] ? project(LABELS[TERRITORIES[at].key]) : labelOf(outlines[at].rings));
const sea = TERRITORIES.map(() => new Set());
const seaLines = [];
for (const [a, b] of EUROPE_SEA_EDGES) {
  const [i, j] = [index.get(a), index.get(b)];
  if (i === undefined || j === undefined) throw new Error(`Sea route ${a}–${b} names no territory.`);
  if (land[i].has(j)) throw new Error(`${a} and ${b} share a land border already; the sea route is not needed.`);
  sea[i].add(j);
  sea[j].add(i);
  const drawn = SEA_DRAWN[`${a}-${b}`] ?? SEA_DRAWN[`${b}-${a}`];
  if (drawn === undefined) throw new Error(`Sea route ${a}–${b} has no drawing in SEA_DRAWN.`);
  seaLines.push(crossingLine(project(drawn.from), project(drawn.to), project(drawn.to)));
}

const labels = TERRITORIES.map((_, at) => labelFor(at));
const shapes = outlines.map((_, at) => pathOf(thinnedRings(at)));
const boxes = outlines.map(({ rings }) => {
  const points = rings.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
});
const bordersPath = regionBorders.map(([a, b]) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`).join("");

// No date in the header: the same source makes the same files, so a rebuild that changes nothing shows nothing.
const header = [
  `/*`,
  ` * WRITTEN BY scripts/map-europe.mjs, NEVER BY HAND: run it again to change the map.`,
  ` * From Natural Earth's admin-1 states and provinces at 1:10m, which is in the public domain`,
  ` * (naturalearthdata.com; ${REMOTE}).`,
  ` */`,
];

writeFileSync(
  DATA_OUT,
  [
    ...header,
    `import type { TenkaTerritoryData } from "./tenka.types.ts";`,
    ``,
    `/** Tenka's Europe, forty-nine territories in region order: each one's key, name, region, and neighbours by land and by sea (indices into this list). */`,
    `export const TENKA_EUROPE_TERRITORY_DATA: readonly TenkaTerritoryData[] = [`,
    ...TERRITORIES.map(
      (territory, at) =>
        `  { key: ${JSON.stringify(territory.key)}, name: ${JSON.stringify(territory.name)}, continent: ${JSON.stringify(territory.continent)}, land: [${[...land[at]].sort((x, y) => x - y).join(", ")}], sea: [${[...sea[at]].sort((x, y) => x - y).join(", ")}] },`,
    ),
    `];`,
    ``,
  ].join("\n"),
);

writeFileSync(
  SHAPES_OUT,
  [
    ...header,
    `import type { TenkaShapes } from "./tenka.types.ts";`,
    ``,
    `/**`,
    ` * How Tenka's Europe is drawn: Miller's projection from ${-FRAME.west}°W to ${FRAME.east}°E and ${FRAME.south}°N to ${FRAME.north}°N, ${WIDTH} by ${HEIGHT} units.`,
    ` * One outline per territory, in the order of \`TENKA_EUROPE_TERRITORY_DATA\`; where its army counter stands; its extent; the`,
    ` * sea routes' dashed lines; the links that go off one edge and on at the other (none here); and the borders between regions, drawn heavier. Read only by the board in`,
    ` * the browser, so none of it is carried by a page the server renders for the rules.`,
    ` */`,
    `export const TENKA_EUROPE_SHAPES: TenkaShapes = {`,
    `  width: ${WIDTH},`,
    `  height: ${HEIGHT},`,
    `  labels: ${JSON.stringify(labels)},`,
    `  boxes: ${JSON.stringify(boxes)},`,
    `  seaLines: ${JSON.stringify(seaLines)},`,
    `  wraps: [],`,
    `  continentBorders: ${JSON.stringify(bordersPath)},`,
    `  outlines: [`,
    ...shapes.map((d) => `    ${JSON.stringify(d)},`),
    `  ],`,
    `};`,
    ``,
  ].join("\n"),
);

const size = (path) => readFileSync(path).length;
console.log(`${TERRITORIES.length} territories, ${EUROPE_LAND_EDGES.length} land borders and ${EUROPE_SEA_EDGES.length} sea routes, ${WIDTH}x${HEIGHT}; ${DATA_OUT} ${size(DATA_OUT)} bytes, ${SHAPES_OUT} ${size(SHAPES_OUT)} bytes.`);
for (const [at, territory] of TERRITORIES.entries()) {
  console.log(`${territory.key.padEnd(16)} ${String(counts.get(territory.key) ?? 0).padStart(3)} pieces  land ${[...land[at]].map((other) => TERRITORIES[other].key).join(", ")}${sea[at].size ? ` | sea ${[...sea[at]].map((other) => TERRITORIES[other].key).join(", ")}` : ""}`);
}
