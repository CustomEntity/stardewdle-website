-- Stardewdle schema — mirrors Brawldle's entity / *_translations / daily_* pattern.
-- Safe to re-run (idempotent).

CREATE TABLE IF NOT EXISTS villagers (
    id            SERIAL PRIMARY KEY,
    key           TEXT UNIQUE NOT NULL,          -- internal Stardew id, e.g. "Abigail"
    gender        TEXT,                          -- Male | Female | Undefined
    region        TEXT,                          -- Town | Mountain | Forest | Beach | Desert | Sewers | Ginger Island
    birth_season  TEXT,                          -- Spring | Summer | Fall | Winter
    birth_day     INTEGER,                       -- 1..28
    marriageable  BOOLEAN NOT NULL DEFAULT FALSE,
    age           TEXT,                          -- Adult | Teen | Child
    love_interest TEXT,
    home_location TEXT,
    loved_gifts   JSONB,                         -- string[] of loved gift display names (EN)
    loved_gift_sprite INTEGER,                   -- springobjects SpriteIndex of the first loved gift (null if custom sheet)
    portrait_url  TEXT,
    released      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations for columns added after the initial villagers table
ALTER TABLE villagers ADD COLUMN IF NOT EXISTS loved_gift_sprite INTEGER;

CREATE TABLE IF NOT EXISTS villager_translations (
    villager_id INTEGER NOT NULL REFERENCES villagers(id) ON DELETE CASCADE,
    language    TEXT NOT NULL,                   -- 'en', 'fr', ...
    name        TEXT NOT NULL,
    PRIMARY KEY (villager_id, language)
);

CREATE TABLE IF NOT EXISTS daily_classic (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER NOT NULL,
    date        DATE NOT NULL UNIQUE,
    villager_id INTEGER NOT NULL REFERENCES villagers(id)
);

CREATE TABLE IF NOT EXISTS daily_pixel (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER NOT NULL,
    date        DATE NOT NULL UNIQUE,
    villager_id INTEGER NOT NULL REFERENCES villagers(id)
);

CREATE TABLE IF NOT EXISTS villager_emojis (
    villager_id INTEGER NOT NULL REFERENCES villagers(id) ON DELETE CASCADE,
    emoji       TEXT NOT NULL,
    position    INTEGER NOT NULL,
    PRIMARY KEY (villager_id, position)
);

CREATE TABLE IF NOT EXISTS daily_emoji (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER NOT NULL,
    date        DATE NOT NULL UNIQUE,
    villager_id INTEGER NOT NULL REFERENCES villagers(id)
);

CREATE TABLE IF NOT EXISTS patch_notes (
    id      SERIAL PRIMARY KEY,
    date    DATE NOT NULL,
    mode    TEXT NOT NULL,
    content TEXT NOT NULL
);
