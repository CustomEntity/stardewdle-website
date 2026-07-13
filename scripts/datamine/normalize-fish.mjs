// Normalize datamined Fish -> fish.json for the "Fish" guessing mode.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'raw');
const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));

const fish = read('Fish.json');
const objects = read('Objects.json');
const namesEN = read('Strings_Objects.json');
const namesFR = read('Strings_Objects.fr-FR.json');
const locations = read('Locations.json');

// --- Fishing area from Data/Locations (1.6 stores each location's fish spawns) ---
// Map the game's location keys to clean display-area tokens (i18n'd in pages.fish.attributes.area).
const LOC_AREA = {
  Beach: 'Ocean', Town: 'Town', Forest: 'Forest', Mountain: 'Mountain', Desert: 'Desert',
  Woods: 'SecretWoods', Sewer: 'Sewers', BugLand: 'BugLair', UndergroundMine: 'Mines',
  WitchSwamp: 'WitchSwamp', Caldera: 'GingerIsland', IslandWest: 'GingerIsland',
  IslandSouth: 'GingerIsland', IslandSouthEast: 'GingerIsland', IslandSouthEastCave: 'GingerIsland',
  IslandNorth: 'GingerIsland', IslandEast: 'GingerIsland',
};
// Deliberately NOT mapped: Submarine/BeachNightMarket (inherit regular ocean fish -> false
// "Night Market"), Backwoods/Temp/fishingGame (generic/festival lists), Farm_* (farm-map variants).
const AREA_ORDER = ['Town', 'Forest', 'Mountain', 'Ocean', 'Desert', 'SecretWoods', 'Sewers',
  'BugLair', 'Mines', 'WitchSwamp', 'NightMarket', 'GingerIsland'];
// Fish whose true area isn't (cleanly) in Data/Locations, from the wiki:
// Mines fishing is code-hardcoded; the deep-sea trio is Night-Market-only but is also listed
// under Beach with magic-bait conditions (which would wrongly read as "Ocean").
const AREA_OVERRIDE = {
  '158': ['Mines'],        // Stonefish (Mines, floor 20)
  '161': ['Mines'],        // Ice Pip (Mines, floor 60)
  '800': ['NightMarket'],  // Blobfish
  '798': ['NightMarket'],  // Midnight Squid
  '799': ['NightMarket'],  // Spook Fish
};
const areaIds = (e) => {
  const out = [];
  const grab = (s) => {
    if (typeof s !== 'string') return;
    for (const part of s.split('|')) {
      const m = part.match(/^\(O\)([A-Za-z0-9_]+)$/) || part.match(/^(\d+)$/);
      if (m) out.push(m[1]);
    }
  };
  grab(e.ItemId); grab(e.Id);
  if (Array.isArray(e.RandomItemId)) e.RandomItemId.forEach(grab);
  return out;
};
const areaByKey = {};
for (const [loc, data] of Object.entries(locations)) {
  const area = LOC_AREA[loc];
  if (!area) continue;
  for (const e of (data.Fish || [])) for (const id of areaIds(e)) (areaByKey[id] ??= new Set()).add(area);
}
const areasFor = (id) => {
  const set = AREA_OVERRIDE[id] ? new Set(AREA_OVERRIDE[id]) : (areaByKey[id] || new Set());
  return AREA_ORDER.filter((a) => set.has(a));
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const SEASON = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
const WEATHER = { sunny: 'Sunny', rainy: 'Rainy', both: 'Any' };
const BEHAVIOR = { floater: 'Floater', dart: 'Dart', smooth: 'Smooth', mixed: 'Mixed', sinker: 'Sinker' };

function resolveToken(token, dict) {
  if (typeof token !== 'string') return null;
  const m = token.match(/\[LocalizedText\s+Strings\\[^:]+:([^\]]+)\]/);
  return m ? (dict[m[1]] ?? null) : token;
}
function objName(id, dict) {
  const o = objects[id];
  return o ? (resolveToken(o.DisplayName, dict) ?? o.Name ?? id) : id;
}

const out = [];
for (const [id, line] of Object.entries(fish)) {
  if (typeof line !== 'string') continue;
  const o = objects[id];
  if (!o || String(o.Category) !== '-4') continue;      // real fish only (excludes junk/algae)
  const p = line.split('/');
  if (p[1] === 'trap' || p[2] === 'trap') continue;     // rod-caught only (no crab-pot)
  const behavior = BEHAVIOR[p[2]];
  if (!behavior) continue;

  let sheet = null, sprite = null;
  if (typeof o.SpriteIndex === 'number') {
    if (!o.Texture) { sheet = 'springobjects'; sprite = o.SpriteIndex; }
    else if (o.Texture === 'TileSheets\\Objects_2') { sheet = 'objects_2'; sprite = o.SpriteIndex; }
  }

  out.push({
    key: String(id),
    name: objName(id, namesEN),
    name_fr: objName(id, namesFR),
    difficulty: parseInt(p[1], 10) || 0,
    behavior,
    maxSize: parseInt(p[4], 10) || 0,
    seasons: (p[6] || '').trim().split(/\s+/).filter(Boolean).map((s) => SEASON[s] ?? cap(s)),
    weather: WEATHER[p[7]] ?? cap(p[7] || ''),
    area: areasFor(id),
    sprite,
    sheet
  });
}

// Legendary fish spawn is code-special-cased, so their season in Data/Fish is a wrong
// placeholder (e.g. Crimsonfish says "winter" but is actually Summer). Override with the
// real seasons (base legendaries + the 1.5 "Extended Family" variants).
const LEGENDARY_SEASONS = {
  '159': ['Summer'],                              // Crimsonfish
  '160': ['Fall'],                                // Angler
  '163': ['Spring'],                              // Legend
  '682': ['Spring', 'Summer', 'Fall', 'Winter'],  // Mutant Carp (Sewers)
  '775': ['Winter'],                              // Glacierfish
  '898': ['Summer'],                              // Son of Crimsonfish
  '899': ['Fall'],                                // Ms. Angler
  '900': ['Spring'],                              // Legend II
  '901': ['Spring', 'Summer', 'Fall', 'Winter'],  // Radioactive Carp
  '902': ['Winter']                               // Glacierfish Jr.
};
for (const f of out) if (LEGENDARY_SEASONS[f.key]) f.seasons = LEGENDARY_SEASONS[f.key];

out.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(__dirname, 'fish.json'), JSON.stringify(out, null, 2));

console.log(`fish: ${out.length}`);
const pad = (s, n) => String(s ?? '').padEnd(n);
for (const f of out) console.log(pad(f.name, 18) + pad(f.difficulty, 5) + pad(f.behavior, 9) + pad(f.maxSize, 5) + pad(f.weather, 6) + pad(f.seasons.join('/'), 20) + f.area.join('/'));
console.log('\nweathers:', [...new Set(out.map((f) => f.weather))].join(', '));
console.log('behaviors:', [...new Set(out.map((f) => f.behavior))].join(', '));
console.log('areas:', [...new Set(out.flatMap((f) => f.area))].join(', '));
console.log('no-area:', out.filter((f) => f.area.length === 0).map((f) => f.name).join(', ') || 'none');
console.log('no-sprite:', out.filter((f) => f.sprite == null).map((f) => f.name).join(', ') || 'none');
