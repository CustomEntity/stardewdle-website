import { type BaseGameData, createGameData } from "$lib/stores/baseGameData.svelte";

type DishId = number;
export type DishGameData = BaseGameData<DishId> & {};

const defaultValue: DishGameData = {
    game: 0,
    stats: {
        wins: 0,
        average_tries: 0,
        one_shots: 0,
        current_streak: 0,
        best_streak: 0,
        last_won_game_id: 0,
        tries_per_day: {}
    },
    tries: [],
};

let instance: ReturnType<typeof createGameData> | null = null;

export function useDishGameData() {
    if (!instance) {
        instance = createGameData('dish_data', defaultValue);
    }
    return instance;
}
