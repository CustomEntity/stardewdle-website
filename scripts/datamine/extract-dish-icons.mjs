// Extract each dish's 16x16 icon from its game sheet -> static/dishes/<key>.png
// Also emits static/ui/icon-dish.png (Pizza) as the home/mode icon.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const GA = path.join(ROOT, 'game-assets');
const OUT = path.join(ROOT, 'static/dishes');
fs.mkdirSync(OUT, { recursive: true });

const dishes = JSON.parse(fs.readFileSync(path.join(__dirname, 'dishes.json'), 'utf8'));

const SHEETS = {
  springobjects: { file: 'Maps/springobjects.png', cols: 24 },
  objects_2: { file: 'TileSheets/Objects_2.png', cols: 8 },
};
const cache = {};
const sheetPng = (name) => (cache[name] ??= PNG.sync.read(fs.readFileSync(path.join(GA, SHEETS[name].file))));

function extract(sheet, sprite) {
  const src = sheetPng(sheet);
  const cols = SHEETS[sheet].cols;
  const col = sprite % cols;
  const row = Math.floor(sprite / cols);
  const dst = new PNG({ width: 16, height: 16 });
  PNG.bitblt(src, dst, col * 16, row * 16, 16, 16, 0, 0);
  return dst;
}

let ok = 0, skip = 0;
for (const d of dishes) {
  if (d.sprite == null || !SHEETS[d.sheet]) { skip++; continue; }
  fs.writeFileSync(path.join(OUT, `${d.key}.png`), PNG.sync.write(extract(d.sheet, d.sprite)));
  ok++;
}
console.log(`✓ ${ok} dish icons -> static/dishes/  (${skip} skipped)`);

// Mode icon: Pizza (key 206) if present, else the first dish with a sprite.
const iconDish = dishes.find((d) => d.key === '206') ?? dishes.find((d) => d.sprite != null && SHEETS[d.sheet]);
if (iconDish) {
  const uiOut = path.join(ROOT, 'static/ui/icon-dish.png');
  fs.writeFileSync(uiOut, PNG.sync.write(extract(iconDish.sheet, iconDish.sprite)));
  console.log(`✓ mode icon -> static/ui/icon-dish.png (${iconDish.name})`);
}
