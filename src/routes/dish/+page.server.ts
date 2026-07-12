import { queryDatabase } from "$lib/server/db";
import { resolveLocale } from '$lib/server/locale';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const nameSubquery = (dishIdExpr: string) => `
    (SELECT dt.name
     FROM dish_translations dt
     WHERE dt.dish_id = ${dishIdExpr}
       AND dt.language IN ($1, 'en')
     ORDER BY CASE WHEN dt.language = $1 THEN 0 ELSE 1 END
     LIMIT 1)`;

function mapDish(row: any): Dish {
    return {
        id: row.id,
        key: row.key,
        name: row.name,
        source: row.source,
        buffs: row.buffs ?? [],
        energy: row.energy,
        price: row.price,
        ingredients: row.ingredients,
        sprite: row.sprite,
        sheet: row.sheet
    };
}

async function loadDishes(language: string = 'en'): Promise<Dish[]> {
    const statement = `
        SELECT d.id, d.key, ${nameSubquery('d.id')} as name,
               d.source, d.buffs, d.energy, d.price, d.ingredients, d.sprite, d.sheet
        FROM dishes d
        WHERE d.released = true
        ORDER BY d.id;
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.map(mapDish);
}

async function loadYesterdayDish(language: string = 'en'): Promise<{ game_id: number, name: string } | null> {
    const statement = `
        SELECT dd.game_id, ${nameSubquery('dd.dish_id')} as name
        FROM daily_dish dd
        WHERE dd.date = CURRENT_DATE - 1
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    return records.length ? { game_id: records[0].game_id, name: records[0].name } : null;
}

async function loadDailyDish(language: string = 'en'): Promise<DailyDishClassic | null> {
    const statement = `
        SELECT dd.id, dd.game_id, dd.date, d.id as dish_id, d.key,
               ${nameSubquery('d.id')} as name,
               d.source, d.buffs, d.energy, d.price, d.ingredients, d.sprite, d.sheet
        FROM daily_dish dd
            JOIN dishes d ON dd.dish_id = d.id
        WHERE dd.date = CURRENT_DATE
        LIMIT 1
    `;
    const records = await queryDatabase<any[]>(statement, [language.toLowerCase()]);
    if (!records.length) return null;
    const row = records[0];
    return {
        id: row.id,
        game_id: row.game_id,
        date: row.date,
        dish: mapDish({ ...row, id: row.dish_id })
    };
}

export const load: PageServerLoad = async ({ cookies, request }) => {
    try {
        const language = resolveLocale(cookies, request);
        return {
            daily: loadDailyDish(language),
            yesterday: loadYesterdayDish(language),
            dishes: loadDishes(language),
        };
    } catch (err) {
        console.error('Failed to load daily dish data:', err);
        throw error(500, { message: 'Failed to load daily dish data' });
    }
};
