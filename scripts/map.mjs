/**
 * Builds Tenka's map of the world: forty-two territories in six continents,
 * the classic board's world as a graph, drawn from Natural Earth and written
 * into two small static files.
 *
 *   node scripts/map.mjs          the world
 *   node scripts/map.mjs europe   Europe (built by scripts/map-europe.mjs)
 *
 * SOURCE AND LICENCE. Natural Earth's admin-0 countries and, for the world, its
 * admin-1 provinces, states and regions, both at 1:50m (naturalearthdata.com),
 * a common source for maps. Natural Earth is in the public domain: "No
 * permission is needed to use Natural Earth. Crediting the authors is
 * unnecessary." They are fetched here, at build time, from the project's own
 * repository on GitHub and cached in the machine's temporary folder (or read
 * from `TENKA_SOURCE` and `TENKA_ADMIN1_SOURCE` when
 * those name a copy); the site never fetches anything from anywhere to draw
 * the map.
 *
 * WHAT IT DOES, in order:
 *
 *  1. Every country's polygons are given to a territory (`map-world.mjs`):
 *     most countries whole, some by where each polygon lies (France's Guiana is
 *     in South America), and the five too large to be one territory (the United
 *     States, Canada, Russia, China and Australia) by their provinces, states
 *     and regions. Some mainlands are cut along a meridian;
 *     a cut is only made where the meridian crosses the mainland exactly twice.
 *  2. Small islands a finger could never find are left off (`LEAST_AREA`),
 *     never a country's largest piece.
 *  3. Everything is projected on Miller's cylindrical projection — the flat
 *     world map of a classroom wall — from 170°W round to 192°E, so the
 *     Bering Strait is the map's seam and Chukotka stays with the rest of Russia.
 *  4. Where a province's border is the country's border, the two files draw it a
 *     hair apart; the province's points are moved onto the country's
 *     (`snapProvinces`) so the two make the same edges.
 *  5. Each territory's regions are MERGED into one outline: an edge two of
 *     its own regions share is dropped, and what is left is joined up into
 *     rings. Two territories are neighbours by land when they share an edge.
 *  6. The world's graph is checked against `classic-edges.mjs`: every pair there
 *     must share a border or be named in `WORLD_SEA_LINKS`, and no other pair may
 *     touch. A map that differs is not written.
 *  7. Written out: `src/tenkaWorld.data.ts` (names, continents, land neighbours
 *     and the sea links — what the rules read) and `src/tenkaShapes.data.ts`
 *     (outlines as SVG paths, simplified to under a pixel, label points, the sea
 *     links' dashed lines and the continents' borders — what only the browser's
 *     board draws).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CLASSIC_EDGES } from "./classic-edges.mjs";
import { WORLD_CONTINENTS, WORLD_COUNTRIES, WORLD_CUT_MERIDIANS, WORLD_REGIONS, WORLD_SEA_LINKS, WORLD_TERRITORIES } from "./map-world.mjs";

/** Which map to build: `node scripts/map.mjs` for the world, `node scripts/map.mjs europe` for Europe, which has a script of its own. */
const MAP = process.argv[2] ?? "world";
if (MAP === "europe") {
  await import("./map-europe.mjs");
  process.exit(0);
}
if (MAP !== "world") throw new Error(`No map called ${MAP}: world or europe.`);
const SCALE_NAME = "50m";
const REMOTE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_${SCALE_NAME}_admin_0_countries.geojson`;
const CACHE = process.env.TENKA_SOURCE ?? join(tmpdir(), `ne_${SCALE_NAME}_admin_0_countries.geojson`);
/** The world is built from the provinces and states of its largest countries too (Natural Earth's admin-1, also public domain). */
const REMOTE_ADMIN1 = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_${SCALE_NAME}_admin_1_states_provinces.geojson`;
const CACHE_ADMIN1 = process.env.TENKA_ADMIN1_SOURCE ?? join(tmpdir(), `ne_${SCALE_NAME}_admin_1_states_provinces.geojson`);
const WORLD_OUT = "src/tenkaWorld.data.ts";
const SHAPES_OUT = "src/tenkaShapes.data.ts";
/** What the two files export. */
const DATA_NAME = "TENKA_TERRITORY_DATA";
const SHAPES_NAME = "TENKA_SHAPES";

/** The map's width in its own units; coordinates are whole units, which is fine enough at four times zoom. */
const WIDTH = 2000;
/** The seam, and how far round the map runs from it. */
const WEST = -170;
const EAST = 192;
/** The rows of the map: Greenland's northern tip to Tierra del Fuego. */
const NORTH = 84;
const SOUTH = -56.5;
/** The least an island's outline may enclose, in square map units, to be drawn: about four pixels square at a whole-world view. */
const LEAST_AREA = 30;

/** The six continents, in the order the rules list them. */
const CONTINENTS = WORLD_CONTINENTS;

/** The territories, in continent order (in `map-world.mjs`). */
const TERRITORIES = WORLD_TERRITORIES;

/*
 * Every country's territory, by its ISO code (Natural Earth's ADM0_A3 where
 * the ISO code is missing). A string gives the whole country; a function is
 * asked of each of its polygons by the polygon's centre (`lon`, `lat`) and
 * whether it is the country's largest (`main`), and answers a territory, a
 * CUT (`{ at: [meridians], into: [territories west to east] }`), or null to
 * leave that piece off the map.
 */
const COUNTRIES = WORLD_COUNTRIES;

/** The sea links: see `WORLD_SEA_LINKS` for what each option does. */
const SEA_LINKS = WORLD_SEA_LINKS;

// ——— Geometry ———

const RAD = Math.PI / 180;
const miller = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * RAD));
const SCALE = WIDTH / ((EAST - WEST) * RAD);
const TOP = miller(NORTH);
const HEIGHT = Math.round((TOP - miller(SOUTH)) * SCALE);
const project = ([lon, lat]) => [Math.round((lon - WEST) * RAD * SCALE), Math.round((TOP - miller(Math.max(SOUTH, Math.min(NORTH, lat)))) * SCALE)];

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

function centreOf(ring) {
  let x = 0;
  let y = 0;
  for (const [px, py] of ring) {
    x += px;
    y += py;
  }
  return { lon: x / ring.length, lat: y / ring.length };
}

/** A ring without its closing point, which GeoJSON repeats. */
const open = (ring) => (ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring);

/**
 * The point where a meridian crosses an edge, worked out the same way
 * whichever end the edge is walked from, so the two halves of a cut country
 * meet at exactly the same point and share their edge.
 */
function crossing(a, b, at) {
  const [p, q] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a];
  const t = (at - p[0]) / (q[0] - p[0]);
  return [at, p[1] + t * (q[1] - p[1])];
}

/** Every meridian some mainland is cut along. */
const CUT_MERIDIANS = WORLD_CUT_MERIDIANS;

/**
 * A ring with a point added wherever it crosses a cut meridian. Done to EVERY
 * ring, not only the ones cut, so that where a cut mainland meets a
 * neighbour — Canada west of 97°W meeting the United States east of 100°W
 * along the 49th parallel — both have the same point there, and their shared
 * border is the same edges on either side.
 */
function withCutPoints(ring) {
  const out = [];
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    const between = CUT_MERIDIANS.filter((at) => (a[0] < at && b[0] > at) || (a[0] > at && b[0] < at)).sort((x, y) => (a[0] < b[0] ? x - y : y - x));
    for (const at of between) out.push(crossing(a, b, at));
  }
  return out;
}

/** How many times a meridian crosses a ring. */
function crossings(ring, at) {
  let count = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (a[0] < at !== b[0] < at) count += 1;
  }
  return count;
}

/** The part of a ring west (`side` -1) or east (+1) of a meridian: Sutherland and Hodgman against one line. */
function clipRing(ring, at, side) {
  const inside = (p) => (side < 0 ? p[0] < at : p[0] >= at);
  const out = [];
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (inside(a)) {
      out.push(a);
      if (!inside(b)) out.push(crossing(a, b, at));
    } else if (inside(b)) {
      out.push(crossing(a, b, at));
    }
  }
  return out;
}

/** A ring cut along several meridians, west to east: one piece for each territory in `into`. */
function cutRing(ring, meridians, into) {
  for (const at of meridians) {
    const count = crossings(ring, at);
    if (count !== 2) throw new Error(`The meridian ${at} crosses a mainland ${count} times; choose one that crosses it twice.`);
  }
  const pieces = [];
  let rest = ring;
  meridians.forEach((at, index) => {
    pieces.push({ territory: into[index], ring: clipRing(rest, at, -1) });
    rest = clipRing(rest, at, 1);
  });
  pieces.push({ territory: into.at(-1), ring: rest });
  return pieces.filter((piece) => piece.ring.length >= 3);
}

// ——— Reading the source ———

async function download(cache, remote) {
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  const response = await fetch(remote);
  if (!response.ok) throw new Error(`Could not fetch ${remote}: ${response.status}`);
  const text = await response.text();
  writeFileSync(cache, text);
  return JSON.parse(text);
}

const source = () => download(CACHE, REMOTE);

const codeOf = (properties) => (properties.ISO_A2_EH && properties.ISO_A2_EH !== "-99" ? properties.ISO_A2_EH : properties.ADM0_A3);

/** One polygon's rings in longitude and latitude, with the cut points added and the far east of the map moved to the right of the seam. */
function ringsOf(polygon) {
  return polygon.map((ring) => {
    const kept = open(ring);
    // East of the seam: Chukotka's tip and Fiji's eastern islands, which Natural Earth writes west of 180°.
    return withCutPoints(kept.every(([lon]) => lon < -168) ? kept.map(([lon, lat]) => [lon + 360, lat]) : kept);
  });
}

/** A feature's polygons, each as its rings. */
const polygonsOf = (feature) => (feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates).map(ringsOf);

/** Gives a feature's polygons to the territories its rule names, adding them to `byTerritory`. */
let featureCount = 0;
function place(byTerritory, code, rule, polygons, admin1) {
  const feature = (featureCount += 1);
  const largest = Math.max(...polygons.map((polygon) => Math.abs(ringArea(polygon[0]))));
  for (const polygon of polygons) {
    const main = Math.abs(ringArea(polygon[0])) === largest;
    const centre = centreOf(polygon[0]);
    // A piece east of the seam in the United States (the Aleutians' far end) is left off, as Hawaii is, rather than given to a territory on the other side of the world.
    if (code === "USA" && centre.lon > 180) continue;
    const answer = typeof rule === "string" ? rule : rule === null ? null : rule({ ...centre, main });
    if (answer === null) continue;
    if (typeof answer === "string") {
      byTerritory.get(answer).push({ code, main, rings: polygon, admin1, feature });
      continue;
    }
    if (polygon.length > 1) throw new Error(`${code}: a mainland with a hole cannot be cut here.`);
    for (const piece of cutRing(polygon[0], answer.at, answer.into)) if (piece.territory !== null) byTerritory.get(piece.territory).push({ code, main: true, rings: [piece.ring], admin1, feature });
  }
}

/** Every country's polygons given to their territories: rings in longitude and latitude, the outer ring first. */
function assign(features, regions) {
  const byTerritory = new Map(TERRITORIES.map((territory) => [territory.key, []]));
  const cut = WORLD_REGIONS;
  for (const feature of features) {
    const code = codeOf(feature.properties);
    // The countries cut by their own provinces are read from the provinces instead.
    if (feature.properties.ADM0_A3 in cut) continue;
    // The world must account for every country.
    if (!(code in COUNTRIES)) throw new Error(`${code} (${feature.properties.NAME}) is given to no territory; add it to COUNTRIES, or null to leave it off.`);
    if (COUNTRIES[code] === null) continue;
    place(byTerritory, code, COUNTRIES[code], polygonsOf(feature), false);
  }
  for (const feature of regions) {
    const { adm0_a3: code, name } = feature.properties;
    if (!(code in cut)) continue;
    const table = cut[code];
    const rule = name in table ? table[name] : table.default;
    if (rule === undefined) throw new Error(`${name} (${code}) is given to no territory; add it to WORLD_REGIONS.`);
    place(byTerritory, code, rule, polygonsOf(feature), true);
  }
  return byTerritory;
}

// ——— Merging a territory's countries into one outline ———

const keyOf = ([x, y]) => `${x},${y}`;

/** A ring in map units: projected, rounded, with repeated points and there-and-back spikes taken out. */
function projectRing(ring) {
  return cleanRing(ring.map(project));
}

/** A ring of map units with repeated points and there-and-back spikes taken out. */
function cleanRing(projected) {
  const points = [];
  for (const point of projected) {
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

/** Every directed edge of a territory's rings, the outer rings anticlockwise on screen and holes the other way. */
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

/**
 * Whether a ring is a sliver and no island: long and so narrow that it encloses
 * less than one unit for each unit of its length. Two provinces of one
 * territory whose files draw their border a few units apart (Quebec and
 * Labrador) leave one, and drawn it is a hair-line across the territory.
 */
function thin(ring) {
  let length = 0;
  for (let i = 0; i < ring.length; i += 1) length += Math.hypot(ring[i][0] - ring[(i + 1) % ring.length][0], ring[i][1] - ring[(i + 1) % ring.length][1]);
  return length > 16 && Math.abs(ringArea(ring)) / length < 1;
}

/**
 * The edge to follow on from `edge` when several leave the point it ends at, which happens where a bay is
 * narrower than a map unit and the coast touches itself: the sharpest turn to the right, which keeps each
 * loop that touches there a loop of its own (the outer rings run clockwise on screen). Where one leaves, that one.
 */
function following(edge, options) {
  if (options.length <= 1) return options[0];
  const [dx, dy] = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]];
  const turn = (next) => Math.atan2(dx * (next[1][1] - next[0][1]) - dy * (next[1][0] - next[0][0]), dx * (next[1][0] - next[0][0]) + dy * (next[1][1] - next[0][1]));
  return options.reduce((best, next) => (turn(next) > turn(best) ? next : best));
}

/** A territory's outline: its edges with every edge its own pieces share dropped, joined back into rings. */
function mergeOutline(pieces) {
  const all = [];
  for (const piece of pieces) {
    const rings = orientated((piece.snapped ?? piece.rings.map(projectRing)).filter((ring) => ring.length >= 3));
    if (rings.length === 0) continue;
    if (!piece.main && Math.abs(ringArea(rings[0])) < LEAST_AREA) continue;
    all.push(...edgesOf(rings));
  }
  const counts = new Map();
  for (const [a, b] of all) counts.set(`${keyOf(a)}>${keyOf(b)}`, (counts.get(`${keyOf(a)}>${keyOf(b)}`) ?? 0) + 1);
  // An edge and its reverse cancel one for one: where one side draws an edge twice (a spit that touches itself) and the other once, one is left.
  const cancelled = new Map();
  const kept = all.filter(([a, b]) => {
    const key = `${keyOf(a)}>${keyOf(b)}`;
    const against = counts.get(`${keyOf(b)}>${keyOf(a)}`) ?? 0;
    if (against === 0) return true;
    cancelled.set(key, (cancelled.get(key) ?? 0) + 1);
    return cancelled.get(key) > against;
  });
  // Join the edges left into rings, following each edge on from the point it ends at.
  const from = new Map();
  for (const edge of kept) {
    const key = keyOf(edge[0]);
    if (!from.has(key)) from.set(key, []);
    from.get(key).push(edge);
  }
  const used = new Set();
  const rings = [];
  for (const edge of kept) {
    if (used.has(edge)) continue;
    const ring = [];
    let at = edge;
    while (at !== undefined && !used.has(at)) {
      used.add(at);
      ring.push(at[0]);
      at = following(at, (from.get(keyOf(at[1])) ?? []).filter((next) => !used.has(next)));
    }
    if (ring.length >= 3 && !thin(ring)) rings.push(ring);
  }
  // A ring inside another of the same territory is no lake or island worth drawing: where the files of two provinces draw their border apart, it is the wedge between the two.
  const drawn = rings.filter((ring) => !rings.some((other) => other !== ring && Math.abs(ringArea(other)) > Math.abs(ringArea(ring)) && ring.filter((point) => inside(point, other)).length >= ring.length * 0.6));
  return { rings: drawn, edges: kept };
}

/** How far, in map units, a drawn outline may stray from the one cut from the data: under half a pixel at a whole-world view. */
const SIMPLIFY = 0.7;

/** The points of an open run kept by the Douglas and Peucker rule: those further than `SIMPLIFY` from the straight line between the ends. */
function keepFarPoints(run) {
  const [a, b] = [run[0], run.at(-1)];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const length = Math.hypot(dx, dy);
  let far = -1;
  let farthest = SIMPLIFY;
  for (let i = 1; i < run.length - 1; i += 1) {
    const d = length === 0 ? Math.hypot(run[i][0] - a[0], run[i][1] - a[1]) : Math.abs(dx * (a[1] - run[i][1]) - dy * (a[0] - run[i][0])) / length;
    if (d > farthest) {
      far = i;
      farthest = d;
    }
  }
  return far < 0 ? [a] : [...keepFarPoints(run.slice(0, far + 1)), ...keepFarPoints(run.slice(far))];
}

/** A closed ring with the points that add less than `SIMPLIFY` to its shape taken out; only what is drawn, never what decides who borders whom. */
function simplified(ring) {
  if (SIMPLIFY === 0 || ring.length < 8) return ring;
  let second = 0;
  for (let i = 1; i < ring.length; i += 1) {
    if (Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]) > Math.hypot(ring[second][0] - ring[0][0], ring[second][1] - ring[0][1])) second = i;
  }
  if (second === 0) return ring;
  const turned = [...ring.slice(second), ...ring.slice(0, second)];
  const half = ring.length - second;
  const kept = [...keepFarPoints(turned.slice(0, half + 1)), ...keepFarPoints([...turned.slice(half), turned[0]])];
  return kept.length >= 3 ? kept : ring;
}

/** A ring as a compact SVG path: the first point absolute, every other relative, whole units. */
function pathOf(rings) {
  return rings
    .map((ring) => {
      let d = `M${ring[0][0]} ${ring[0][1]}l`;
      let parts = [];
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

/** The two nearest points of two outlines, for a sea link's dashed line across the strait; `shift` moves the second across the seam. */
function nearest(a, b, shift = 0) {
  let best = null;
  for (const ring of a) {
    for (const p of ring) {
      for (const other of b) {
        for (const q0 of other) {
          const q = [q0[0] + shift, q0[1]];
          const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (best === null || d < best.d) best = { d, p, q };
        }
      }
    }
  }
  return best;
}

/** The least a sea link's dashed line is drawn, in map units: long enough to read as a crossing at a whole-world view, not a dash. */
const LEAST_CROSSING = 64;

/**
 * Islands wholly north of this latitude are drawn but left out of what a view
 * frames: they carry no counter and no link, and counting them made Asia's
 * view as tall as Svalbard to Malaysia, too tall to fill a desk's width.
 */
const FRAME_NORTH = 75;

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

/**
 * Where a province's border is the country's border, or its neighbour
 * province's, Natural Earth draws the one a hair away from the other (the
 * files are made apart, and in a province file Quebec and Labrador do not
 * share every point), which a map of two thousand units across turns into a
 * one-unit gap or overlap. Taking the features in the order they were read,
 * countries first, every point of a province's outline within one unit of a
 * point of an earlier feature's outline is moved onto it, so that the two make
 * the same edges and a border between them is seen as a border.
 */
function snapProvinces(byTerritory) {
  const pieces = [...byTerritory.values()].flat();
  const known = new Map();
  const featureIds = [...new Set(pieces.map((piece) => piece.feature))].sort((x, y) => x - y);
  for (const id of featureIds) {
    const mine = pieces.filter((piece) => piece.feature === id);
    const settled = [];
    for (const piece of mine) {
      piece.snapped = piece.rings.map((ring) => {
        const moved = ring.map(project).map(([x, y]) => {
          if (!piece.admin1) return [x, y];
          let best = null;
          for (let dx = -1; dx <= 1; dx += 1) {
            for (let dy = -1; dy <= 1; dy += 1) {
              const found = known.get(`${x + dx},${y + dy}`);
              // Only another country's: the provinces of one country already agree where they meet.
              if (found && found.code !== piece.code && (best === null || Math.hypot(dx, dy) < best.d)) best = { d: Math.hypot(dx, dy), found: found.point };
            }
          }
          return best === null ? [x, y] : best.found;
        });
        settled.push(...moved.map((point) => ({ point, code: piece.code })));
        return cleanRing(moved);
      });
    }
    for (const { point, code } of settled) if (!known.has(keyOf(point)) || known.get(keyOf(point)).code === code) known.set(keyOf(point), { point, code });
  }
  // A point of one feature that lies on an edge of another's (a long straight border on one side, many short edges on the other) is added to that edge, so that both sides make the same edges.
  const owners = new Map();
  for (const piece of pieces) for (const ring of piece.snapped) for (const point of ring) owners.set(keyOf(point), [...(owners.get(keyOf(point)) ?? []), piece.feature]);
  for (const piece of pieces) {
    piece.snapped = piece.snapped.map((ring) => {
      const out = [];
      for (let i = 0; i < ring.length; i += 1) {
        const [a, b] = [ring[i], ring[(i + 1) % ring.length]];
        out.push(a);
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
        const length2 = dx * dx + dy * dy;
        if (length2 < 4) continue;
        const onEdge = [];
        for (let x = Math.min(a[0], b[0]) - 1; x <= Math.max(a[0], b[0]) + 1; x += 1) {
          for (let y = Math.min(a[1], b[1]) - 1; y <= Math.max(a[1], b[1]) + 1; y += 1) {
            const found = known.get(`${x},${y}`);
            const p = found && found.point;
            const own = p && owners.get(keyOf(p));
            if (!own || own.includes(piece.feature) || found.code === piece.code) continue;
            const t = ((x - a[0]) * dx + (y - a[1]) * dy) / length2;
            if (t <= 0 || t >= 1) continue;
            if (Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy)) <= 0.6) onEdge.push({ t, p });
          }
        }
        onEdge.sort((m, n) => m.t - n.t);
        for (const { p } of onEdge) out.push(p);
      }
      return cleanRing(out);
    });
  }
}

const features = (await source()).features;
const regions = (await download(CACHE_ADMIN1, REMOTE_ADMIN1)).features;
const assigned = assign(features, regions);
snapProvinces(assigned);
const outlines = TERRITORIES.map((territory) => {
  if (!CONTINENTS.includes(territory.continent)) throw new Error(`${territory.key} is in no continent the rules know.`);
  const pieces = assigned.get(territory.key);
  if (pieces.length === 0) throw new Error(`${territory.key} has no land.`);
  return mergeOutline(pieces);
});

const index = new Map(TERRITORIES.map((territory, at) => [territory.key, at]));
const edgeOwner = new Map();
outlines.forEach((outline, at) => {
  for (const [a, b] of outline.edges) edgeOwner.set(`${keyOf(a)}>${keyOf(b)}`, at);
});
const land = TERRITORIES.map(() => new Set());
const continentBorders = [];
outlines.forEach((outline, at) => {
  for (const [a, b] of outline.edges) {
    const other = edgeOwner.get(`${keyOf(b)}>${keyOf(a)}`);
    if (other === undefined || other === at) continue;
    land[at].add(other);
    // Each border between two continents once, from the side listed first.
    if (TERRITORIES[at].continent !== TERRITORIES[other].continent && at < other) continentBorders.push([a, b]);
  }
});
for (const [at, set] of land.entries()) {
  for (const other of set) if (!land[other].has(at)) throw new Error(`${TERRITORIES[at].key} borders ${TERRITORIES[other].key} but not the other way round.`);
}

const labelFor = (at) => (TERRITORIES[at].label ? project(TERRITORIES[at].label) : labelOf(outlines[at].rings));
const sea = TERRITORIES.map(() => new Set());
const seaLines = [];
const wraps = [];
for (const [a, b, options = {}] of SEA_LINKS) {
  const [i, j] = [index.get(a), index.get(b)];
  if (i === undefined || j === undefined) throw new Error(`Sea link ${a}–${b} names no territory.`);
  if (land[i].has(j)) throw new Error(`${a} and ${b} share a land border already; the sea link is not needed.`);
  sea[i].add(j);
  sea[j].add(i);
  if (options.wrap) {
    // Off the map's west edge from the first, and on at its east edge to the second.
    const across = nearest(outlines[i].rings, outlines[j].rings, -WIDTH);
    seaLines.push([across.p[0], across.p[1], 0, Math.round((across.p[1] + across.q[1]) / 2)]);
    seaLines.push([WIDTH, Math.round((across.p[1] + across.q[1]) / 2), across.q[0] + WIDTH, across.q[1]]);
    wraps.push([i, j, Math.round((across.p[1] + across.q[1]) / 2)]);
  } else if (options.anchors) {
    seaLines.push(crossingLine(labelFor(i), labelFor(j), labelFor(j)));
  } else if (options.from) {
    const [p, q] = [project(options.from), project(options.to)];
    seaLines.push(crossingLine(p, q, q));
    for (const more of options.also ?? []) seaLines.push(crossingLine(project(more.from), project(more.to), project(more.to)));
  } else {
    const across = nearest(outlines[i].rings, outlines[j].rings);
    seaLines.push(crossingLine(across.p, across.q, labelFor(j)));
  }
}

// The world must be the classic graph exactly: every pair of territories that touch or are joined by a sea link, and no others.
const pair = (a, b) => [a, b].sort().join("–");
const wanted = new Set(CLASSIC_EDGES.map(([a, b]) => pair(a, b)));
const drawn = new Set();
TERRITORIES.forEach((territory, at) => {
  for (const other of [...land[at], ...sea[at]]) drawn.add(pair(territory.key, TERRITORIES[other].key));
});
const missing = [...wanted].filter((edge) => !drawn.has(edge));
const extra = [...drawn].filter((edge) => !wanted.has(edge));
if (missing.length > 0 || extra.length > 0) {
  throw new Error(`The map is not the classic graph.\n  Missing (no shared border and no sea link): ${missing.join(", ") || "none"}\n  Extra (touch on the map, or a sea link, and not in the graph): ${extra.join(", ") || "none"}`);
}

const labels = TERRITORIES.map((_, at) => labelFor(at));
const shapes = outlines.map((outline) => pathOf(outline.rings.map(simplified)));
/* Each territory's extent, for a view to frame it or its continent: the far northern islands left out (`FRAME_NORTH`). */
const northEdge = project([0, FRAME_NORTH])[1];
const boxes = outlines.map(({ rings }) => {
  const framed = rings.filter((ring) => ring.some(([, y]) => y > northEdge));
  const points = (framed.length > 0 ? framed : rings).flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
});
/* No territory may run more than half the map across: one that does has a piece on the wrong side of the seam. */
boxes.forEach(([left, , right], at) => {
  if (right - left > WIDTH / 2) throw new Error(`${TERRITORIES[at].key} runs from ${left} to ${right}, across half the map; a piece of it is on the wrong side of the seam.`);
});
const bordersPath = continentBorders.map(([a, b]) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`).join("");

// No date in the header: the same source makes the same files, so a rebuild that changes nothing shows nothing.
const header = [
  `/*`,
  ` * WRITTEN BY scripts/map.mjs, NEVER BY HAND: run it again to change the map.`,
  ` * From Natural Earth's admin-0 countries and admin-1 provinces, states and regions at 1:${SCALE_NAME}, which is in the public domain`,
  ` * (naturalearthdata.com; ${REMOTE}; ${REMOTE_ADMIN1}).`,
  ` */`,
];

writeFileSync(
  WORLD_OUT,
  [
    ...header,
    `import type { TenkaTerritoryData } from "./tenka.types.ts";`,
    ``,
    `/** Tenka's forty-two territories in continent order: each one's key, name, continent, and neighbours by land and by sea (indices into this list). */`,
    `export const ${DATA_NAME}: readonly TenkaTerritoryData[] = [`,
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
    ` * How Tenka's world is drawn: Miller's projection from ${-WEST}°W round to ${EAST}°E, ${WIDTH} by ${HEIGHT} units.`,
    ` * One outline per territory, in the order of \`${DATA_NAME}\`; where its army counter stands; its extent; the`,
    ` * sea links' dashed lines; the links that go off one edge and on at the other; and the borders between continents, drawn heavier. Read only by the board in`,
    ` * the browser, so none of it is carried by a page the server renders for the rules.`,
    ` */`,
    `export const ${SHAPES_NAME}: TenkaShapes = {`,
    `  width: ${WIDTH},`,
    `  height: ${HEIGHT},`,
    `  labels: ${JSON.stringify(labels)},`,
    `  boxes: ${JSON.stringify(boxes)},`,
    `  seaLines: ${JSON.stringify(seaLines)},`,
    `  wraps: ${JSON.stringify(wraps)},`,
    `  continentBorders: ${JSON.stringify(bordersPath)},`,
    `  outlines: [`,
    ...shapes.map((d) => `    ${JSON.stringify(d)},`),
    `  ],`,
    `};`,
    ``,
  ].join("\n"),
);

const size = (path) => readFileSync(path).length;
console.log(`${TERRITORIES.length} territories, ${WIDTH}x${HEIGHT}; ${WORLD_OUT} ${size(WORLD_OUT)} bytes, ${SHAPES_OUT} ${size(SHAPES_OUT)} bytes.`);
for (const [at, territory] of TERRITORIES.entries()) {
  console.log(`${territory.key.padEnd(18)} land ${[...land[at]].map((other) => TERRITORIES[other].key).join(", ")}${sea[at].size ? ` | sea ${[...sea[at]].map((other) => TERRITORIES[other].key).join(", ")}` : ""}`);
}
