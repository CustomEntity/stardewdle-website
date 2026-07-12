// Seed the Dish mode: node scripts/db/seed-dishes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const dishes = JSON.parse(fs.readFileSync(path.join(__dirname, '../datamine/dishes.json'), 'utf8'));

function hashDate(iso) {
  let h = 2166136261;
  for (const ch of iso) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const d of dishes) {
      const { rows } = await client.query(
        `INSERT INTO dishes (key, source, buffs, energy, price, ingredients, sprite, sheet, released)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
         ON CONFLICT (key) DO UPDATE SET
            source=EXCLUDED.source, buffs=EXCLUDED.buffs, energy=EXCLUDED.energy,
            price=EXCLUDED.price, ingredients=EXCLUDED.ingredients, sprite=EXCLUDED.sprite, sheet=EXCLUDED.sheet
         RETURNING id`,
        [d.key, d.source, d.buffs, d.energy, d.price, d.ingredients, d.sprite, d.sheet]
      );
      const id = rows[0].id;
      for (const [lang, name] of [['en', d.name], ['fr', d.name_fr]]) {
        if (!name) continue;
        await client.query(
          `INSERT INTO dish_translations (dish_id, language, name) VALUES ($1,$2,$3)
           ON CONFLICT (dish_id, language) DO UPDATE SET name=EXCLUDED.name`,
          [id, lang, name]
        );
      }
    }
    console.log(`✓ upserted ${dishes.length} dishes (+ en/fr names)`);

    const { rows: ids } = await client.query('SELECT id FROM dishes ORDER BY key');
    const pool = ids.map((r) => r.id);
    const today = new Date();
    let inserted = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dishId = pool[hashDate('dish' + iso) % pool.length];
      const res = await client.query(
        `INSERT INTO daily_dish (game_id, date, dish_id) VALUES ($1,$2::date,$3)
         ON CONFLICT (date) DO NOTHING`,
        [i + 1, iso, dishId]
      );
      inserted += res.rowCount;
    }
    console.log(`✓ seeded ${inserted} new daily_dish rows`);
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
