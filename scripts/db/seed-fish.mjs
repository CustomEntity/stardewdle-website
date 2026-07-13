// Seed the Fish mode: node scripts/db/seed-fish.mjs
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

const fish = JSON.parse(fs.readFileSync(path.join(__dirname, '../datamine/fish.json'), 'utf8'));

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

    for (const f of fish) {
      const { rows } = await client.query(
        `INSERT INTO fish (key, difficulty, behavior, max_size, weather, seasons, area, time, sprite, sheet, released)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (key) DO UPDATE SET
            difficulty=EXCLUDED.difficulty, behavior=EXCLUDED.behavior, max_size=EXCLUDED.max_size,
            weather=EXCLUDED.weather, seasons=EXCLUDED.seasons, area=EXCLUDED.area, time=EXCLUDED.time,
            sprite=EXCLUDED.sprite, sheet=EXCLUDED.sheet, released=EXCLUDED.released
         RETURNING id`,
        [f.key, f.difficulty, f.behavior, f.maxSize, f.weather, f.seasons, f.area, f.time, f.sprite, f.sheet, f.released ?? true]
      );
      const id = rows[0].id;
      for (const [lang, name] of [['en', f.name], ['fr', f.name_fr]]) {
        if (!name) continue;
        await client.query(
          `INSERT INTO fish_translations (fish_id, language, name) VALUES ($1,$2,$3)
           ON CONFLICT (fish_id, language) DO UPDATE SET name=EXCLUDED.name`,
          [id, lang, name]
        );
      }
    }
    console.log(`✓ upserted ${fish.length} fish (+ en/fr names)`);

    const { rows: ids } = await client.query('SELECT id FROM fish WHERE released = true ORDER BY key');
    const pool = ids.map((r) => r.id);

    // Re-roll any already-seeded upcoming daily that landed on a now-unreleased fish.
    const { rows: bad } = await client.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS iso FROM daily_fish
       WHERE date >= CURRENT_DATE AND fish_id NOT IN (SELECT id FROM fish WHERE released = true)`
    );
    for (const { iso } of bad) {
      await client.query('UPDATE daily_fish SET fish_id=$1 WHERE date=$2::date',
        [pool[hashDate('fish' + iso) % pool.length], iso]);
    }
    if (bad.length) console.log(`✓ re-rolled ${bad.length} upcoming daily_fish off excluded fish`);

    const today = new Date();
    let inserted = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const fishId = pool[hashDate('fish' + iso) % pool.length];
      const res = await client.query(
        `INSERT INTO daily_fish (game_id, date, fish_id) VALUES ($1,$2::date,$3)
         ON CONFLICT (date) DO NOTHING`,
        [i + 1, iso, fishId]
      );
      inserted += res.rowCount;
    }
    console.log(`✓ seeded ${inserted} new daily_fish rows`);
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
