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
    sprite,
    sheet
  });
}

out.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(__dirname, 'fish.json'), JSON.stringify(out, null, 2));

console.log(`fish: ${out.length}`);
const pad = (s, n) => String(s ?? '').padEnd(n);
for (const f of out) console.log(pad(f.name, 18) + pad(f.difficulty, 5) + pad(f.behavior, 9) + pad(f.maxSize, 5) + pad(f.weather, 6) + f.seasons.join('/'));
console.log('\nweathers:', [...new Set(out.map((f) => f.weather))].join(', '));
console.log('behaviors:', [...new Set(out.map((f) => f.behavior))].join(', '));
console.log('no-sprite:', out.filter((f) => f.sprite == null).map((f) => f.name).join(', ') || 'none');
