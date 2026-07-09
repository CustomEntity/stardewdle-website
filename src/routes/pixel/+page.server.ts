import { queryDatabase } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from './$types';

const nameSubquery = (villagerIdExpr: string) => `
    (SELECT vt.name
     FROM villager_translations vt
     WHERE vt.villager_id = ${villagerIdExpr}
       AND vt.language IN ($1, 'en')
     ORDER BY CASE WHEN vt.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

// only id/name/portrait needed for the pixel clue + autocomplete
async function loadVillagers(language: string = 'en'): Promise<{ id: number, name: string, portrait_url: string }[]> {
    const statement = `
        SELECT v.id, ${nameSubquery('v.id')} as name, v.portrait_url
        FROM villagers v
        WHERE v.released = true
        ORDER BY v.id;
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.map(row => ({ id: row.id, name: row.name, portrait_url: row.portrait_url }));
}

async function loadYesterdayPixel(language: string = 'en'): Promise<{ game_id: number, villager_name: string } | null> {
    const statement = `
        SELECT d.game_id, ${nameSubquery('d.villager_id')} as villager_name
        FROM daily_pixel d
        WHERE d.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, villager_name: records[0].villager_name } : null;
}

async function loadDailyPixel(language: string = 'en'): Promise<DailyPixelVillager | null> {
    const statement = `
        SELECT d.id, d.game_id, d.date, d.villager_id,
               ${nameSubquery('v.id')} as name,
               v.portrait_url
        FROM daily_pixel d
            JOIN villagers v ON d.villager_id = v.id
        WHERE d.date = CURRENT_DATE
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    if (!records.length) return null;
    const row = records[0];
    return {
        id: row.id,
        game_id: row.game_id,
        date: row.date,
        villager: { id: row.villager_id, name: row.name, portrait_url: row.portrait_url }
    };
}

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const language = cookies.get('locale') || 'en';
        return {
            daily: loadDailyPixel(language),
            yesterday: loadYesterdayPixel(language),
            villagers: loadVillagers(language),
        };
    } catch (err) {
        console.error('Failed to load daily pixel data:', err);
        throw error(500, { message: 'Failed to load daily pixel data' });
    }
};
