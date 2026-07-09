import {type BaseGameData, createGameData} from "$lib/stores/baseGameData.svelte";

type BrawlerId = number;
export type EmojiGameData = BaseGameData<BrawlerId> & {}

const defaultValue: EmojiGameData = {
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

export function useEmojiGameData() {
    if (!instance) {
        instance = createGameData('emoji_data', defaultValue);
    }
    return instance;
}
