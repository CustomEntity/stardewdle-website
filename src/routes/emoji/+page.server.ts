import { queryDatabase } from "$lib/server/db";
import { error } from "@sveltejs/kit";

export type PatchNote = {
    id: number;
    date: string;
    mode: string;
    content: string;
}

const nameSubquery = (villagerIdExpr: string) => `
    (SELECT vt.name
     FROM villager_translations vt
     WHERE vt.villager_id = ${villagerIdExpr}
       AND vt.language IN ($1, 'en')
     ORDER BY CASE WHEN vt.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

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

async function loadYesterdayEmoji(language: string = 'en'): Promise<{ game_id: number, villager_name: string } | null> {
    const statement = `
        SELECT d.game_id, ${nameSubquery('d.villager_id')} as villager_name
        FROM daily_emoji d
        WHERE d.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, villager_name: records[0].villager_name } : null;
}

async function loadDailyEmoji(language: string = 'en'): Promise<DailyEmojiVillager | null> {
    const statement = `
        SELECT d.id, d.game_id, d.date, d.villager_id,
               ${nameSubquery('v.id')} as name,
               v.portrait_url,
               (SELECT json_agg(jsonb_build_object('emoji', ve.emoji, 'position', ve.position) ORDER BY ve.position)
                FROM villager_emojis ve
                WHERE ve.villager_id = v.id) as emojis
        FROM daily_emoji d
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
        emojis: row.emojis || [],
        villager: { id: row.villager_id, name: row.name, portrait_url: row.portrait_url }
    };
}

export const load = async ({ cookies }) => {
    try {
        const language = cookies.get('locale') || 'en';
        return {
            daily: loadDailyEmoji(language),
            yesterday: loadYesterdayEmoji(language),
            villagers: loadVillagers(language),
            patchNotes: Promise.resolve([]) as Promise<PatchNote[]>,
        };
    } catch (err) {
        console.error('Failed to load daily emoji data:', err);
        throw error(500, { message: 'Failed to load daily emoji data' });
    }
};
