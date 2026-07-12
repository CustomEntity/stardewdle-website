// Normalize datamined CookingRecipes -> dishes.json for the "Dish" guessing mode.
//   node scripts/datamine/normalize-dishes.mjs
// Each cooking recipe yields a Cooking object (Category -7); we join to Objects.json for
// price / edibility (energy) / buffs / icon, and derive the recipe SOURCE from the unlock field.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'raw');
const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));

const recipes = read('CookingRecipes.json');
const objects = read('Objects.json');
const objNamesEN = read('Strings_Objects.json');
const objNamesFR = read('Strings_Objects.fr-FR.json');

function resolveToken(token, dict) {
  if (typeof token !== 'string') return null;
  const m = token.match(/\[LocalizedText\s+Strings\\[^:]+:([^\]]+)\]/);
  return m ? (dict[m[1]] ?? null) : token;
}
function objName(o, dict) {
  if (!o) return null;
  return resolveToken(o.DisplayName, dict) ?? o.Name ?? null;
}

// Data\CookingRecipes value: "<ingredients>/<unused>/<yield>/<unlock>/<displayName?>"
// unlock: default (starter) | f <NPC> <hearts> | s <skill> <lvl> | l <n> (Queen of Sauce TV) | null (special)
function sourceOf(unlock) {
  const u = (unlock || '').trim();
  if (u === 'default') return 'Starter';
  if (u === '' || u === 'null') return 'Special';
  if (u.startsWith('f ')) return 'Friendship';
  if (u.startsWith('s ')) return 'Skill';
  if (u.startsWith('l ')) return 'QueenOfSauce';
  return 'Special';
}

// Buff CustomAttributes -> our short labels (kept in a stable display order)
const BUFF_LABELS = {
  FarmingLevel: 'Farming', FishingLevel: 'Fishing', MiningLevel: 'Mining',
  ForagingLevel: 'Foraging', CombatLevel: 'Combat', LuckLevel: 'Luck',
  MaxStamina: 'MaxEnergy', MagneticRadius: 'Magnetism', Speed: 'Speed',
  Defense: 'Defense', Attack: 'Attack', Immunity: 'Immunity',
};
const BUFF_ORDER = ['Farming', 'Fishing', 'Mining', 'Foraging', 'Combat', 'Luck',
  'MaxEnergy', 'Magnetism', 'Speed', 'Defense', 'Attack', 'Immunity'];

function buffsOf(o) {
  const set = new Set();
  for (const b of (o.Buffs || [])) {
    const ca = b?.CustomAttributes || {};
    for (const [k, v] of Object.entries(ca)) {
      if (v && BUFF_LABELS[k]) set.add(BUFF_LABELS[k]);
    }
  }
  return BUFF_ORDER.filter((x) => set.has(x));
}

const out = [];
const noObj = [], noSprite = [];
for (const [recipeKey, raw] of Object.entries(recipes)) {
  const p = String(raw).split('/');
  const ingredientTokens = (p[0] || '').trim().split(/\s+/).filter(Boolean);
  const ingredients = Math.floor(ingredientTokens.length / 2);
  const yieldId = (p[2] || '').trim().split(/\s+/)[0];
  const o = objects[yieldId];
  if (!o) { noObj.push(`${recipeKey} -> ${yieldId}`); continue; }

  // icon: springobjects (Texture null) or the 1.6 Objects_2 sheet
  let sheet = null, sprite = null;
  if (typeof o.SpriteIndex === 'number') {
    if (!o.Texture) { sheet = 'springobjects'; sprite = o.SpriteIndex; }
    else if (o.Texture === 'TileSheets\\Objects_2') { sheet = 'objects_2'; sprite = o.SpriteIndex; }
  }
  if (sprite == null) noSprite.push(recipeKey);

  out.push({
    key: String(yieldId),
    name: objName(o, objNamesEN) ?? recipeKey,
    name_fr: objName(o, objNamesFR) ?? objName(o, objNamesEN) ?? recipeKey,
    source: sourceOf(p[3]),
    buffs: buffsOf(o),
    energy: Math.round((o.Edibility ?? 0) * 2.5),
    price: o.Price ?? null,
    ingredients,
    sprite,
    sheet,
  });
}

out.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(__dirname, 'dishes.json'), JSON.stringify(out, null, 2));

// ---- report ----
console.log(`dishes: ${out.length}`);
const pad = (s, n) => String(s ?? '').padEnd(n);
console.log(pad('NAME', 18) + pad('ENERGY', 8) + pad('PRICE', 7) + pad('ING', 5) + pad('SOURCE', 14) + 'BUFFS');
for (const d of out) console.log(pad(d.name, 18) + pad(d.energy, 8) + pad(d.price + 'g', 7) + pad(d.ingredients, 5) + pad(d.source, 14) + d.buffs.join('/'));
const dist = (arr) => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
console.log('\nsources:', JSON.stringify(dist(out.map((d) => d.source))));
console.log('buff labels used:', [...new Set(out.flatMap((d) => d.buffs))].join(', ') || 'none');
console.log('# with no buff:', out.filter((d) => d.buffs.length === 0).length);
console.log('missing objects:', noObj.length ? noObj.join(', ') : 'none');
console.log('no-sprite:', noSprite.length ? noSprite.join(', ') : 'none');
console.log('energy range:', Math.min(...out.map((d) => d.energy)), '..', Math.max(...out.map((d) => d.energy)));
console.log('price range:', Math.min(...out.map((d) => d.price)), '..', Math.max(...out.map((d) => d.price)));
console.log('ingredient range:', Math.min(...out.map((d) => d.ingredients)), '..', Math.max(...out.map((d) => d.ingredients)));
