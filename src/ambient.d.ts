interface Villager {
    id: number;
    name: string;
    gender: string;        // Male | Female | Undefined
    region: string;        // Town | Mountain | Forest | Beach | Desert | Sewers | Ginger Island
    birth_season: string;  // Spring | Summer | Fall | Winter
    birth_day: number;     // 1..28
    marriageable: boolean;
    age: string;           // Adult | Teen | Child
    portrait_url: string;
}

interface DailyClassicVillager {
    id: number;
    game_id: number;
    date: string;
    villager: Villager;
    giftHint: string;
    giftSprite: number | null;
}

interface DailyPixelVillager {
    id: number;
    game_id: number;
    date: string;
    villager: {
        id: number;
        name: string;
        portrait_url: string;
    };
}

interface DailyEmojiVillager {
    id: number;
    game_id: number;
    date: string;
    emojis: Array<{ emoji: string; position: number }>;
    villager: {
        id: number;
        name: string;
        portrait_url: string;
    };
}

interface Crop {
    id: number;
    key: string;
    name: string;
    growth: number;
    price: number;
    regrow: boolean;
    type: string;           // Vegetable | Fruit | Flower | Forage | Seed
    seasons: string[];      // Spring | Summer | Fall | Winter
    sprite: number | null;
    sheet: string | null;   // springobjects | objects_2
}

interface DailyCropClassic {
    id: number;
    game_id: number;
    date: string;
    crop: Crop;
}

interface Brawler {
    id: number;
    name: string;
    rarity: string;
    role: string;
    movement: string;
    range: string;
    reload: string;
    release_year: number;
    portrait_url: string;
}

interface DailyClassicHero {
    id: number;
    game_id: number;
    date: string;
    brawler: Brawler;
    gadgetHint: string
    hyperchargeHint: string
}

interface DailyGadget {
    id: number;
    game_id: number;
    date: Date;
    gadgetHint: {
        name: string;
        image_url: string;
        number: number;
    };
    brawler: Brawler
}

interface DailyStarPower {
    id: number;
    game_id: number;
    date: Date;
    starPowerHint: {
        name: string;
        image_url: string;
        number: number;
    };
    brawler: Brawler;
}

interface DailyHypercharge {
    id: number;
    game_id: number;
    date: Date;
    hyperchargeHint: {
        name: string;
        image_url: string;
        version: number;
    };
    brawler: {
        id: number;
        name: string;
        rarity: string;
        role: string;
        movement: string;
        range: string;
        reload: string;
        release_year: number;
        portrait_url: string;
    };
}

interface DailyPixel {
    id: number;
    game_id: number;
    date: Date;
    brawler: {
        id: number;
        name: string;
        rarity: string;
        role: string;
        movement: string;
        range: string;
        reload: string;
        release_year: number;
        portrait_url: string;
        gender: string;
    };
}

interface SimpleBrawler {
    id: number;
    name: string;
    colors: {
        main: string;
        secondary: string;
    };
    shapes: Array<{
        id: number;
        media: Array<{
            type: string;
            path: string;
        }>;
    }>;
}

interface DailyEmoji {
    id: number;
    game_id: number;
    date: Date;
    emojis: Array<{ emoji: string; position: number }>;
    brawler: {
        id: number;
        name: string;
        rarity: string;
        role: string;
        movement: string;
        range: string;
        reload: string;
        release_year: number;
        portrait_url: string;
    };
}

interface PatchNote {
    id: number;
    date: string;
    mode: string;
    content: string;
}