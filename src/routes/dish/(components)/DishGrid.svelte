<!-- DishGrid.svelte -->
<script lang="ts">
    import { useDishGameData } from "$lib/stores/dishGameData.svelte";
    import { onMount, tick } from "svelte";
    import locale from "$lib/stores/locale.svelte";
    import { media } from "$lib/media";

    interface Props {
        dailyDish: Dish;
        dishes: Dish[];
    }

    const { dailyDish, dishes }: Props = $props();
    const dishGameData = useDishGameData();

    let animations: Record<string, number> = $state({});
    let initialAttemptsCount = $state(-1);

    onMount(() => {
        attempts.forEach((a) => (animations[a.dish.id] = 5));
        initialAttemptsCount = attempts.length;
    });

    const compareNumber = (value: number, target: number) => {
        if (value === target) return "CORRECT";
        return value > target ? "LOWER" : "HIGHER";
    };

    const compareBuffs = (a: string[], b: string[]) => {
        const sb = new Set(b);
        const inter = a.filter((s) => sb.has(s));
        if (a.length === b.length && inter.length === a.length) return "CORRECT";
        if (inter.length > 0) return "PARTIALLY-CORRECT";
        return "INCORRECT";
    };

    const attempts = $derived(
        dishGameData?.tries
            .map((tryId) => {
                const dish = dishes.find((d) => d.id === tryId);
                if (!dish) return null;
                return {
                    dish,
                    differences: {
                        energy: compareNumber(dish.energy, dailyDish.energy),
                        price: compareNumber(dish.price, dailyDish.price),
                        ingredients: compareNumber(dish.ingredients, dailyDish.ingredients),
                        source: dish.source === dailyDish.source ? "CORRECT" : "INCORRECT",
                        buffs: compareBuffs(dish.buffs, dailyDish.buffs),
                    },
                };
            })
            .filter(Boolean),
    );

    $effect(() => {
        const currentLength = attempts.length;
        if (initialAttemptsCount === -1) return;
        if (currentLength > initialAttemptsCount) {
            attempts.slice(initialAttemptsCount).forEach((a) => a && handleNewAttempt(a.dish.id));
            initialAttemptsCount = currentLength;
        }
    });

    async function handleNewAttempt(dishId: number) {
        animations[dishId] = 0;
        await tick();
        const squares = document.getElementsByClassName(`square-${dishId}`);
        for (let i = 0; i < squares.length; i++) {
            setTimeout(() => {
                (squares[i] as HTMLElement).classList.add("animate__animated", "animate__flipInY");
                animations[dishId]++;
            }, i * 700);
        }
    }

    const getBackgroundColor = (status: string) => {
        switch (status) {
            case "CORRECT": return "#32c21c";
            case "PARTIALLY-CORRECT": return "#E1812D";
            default: return "#d40c00";
        }
    };

    const translate = (group: string, value: string | null) => {
        if (!value) return "-";
        const key = `pages.dish.attributes.${group}.${value.replace(/\s+/g, "")}` as const;
        const t = locale.t(key as any);
        return t === key ? value : t;
    };

    const buffsText = (buffs: string[]) =>
        buffs.length ? buffs.map((b) => translate("buff", b)).join(" / ") : translate("buff", "None");
</script>

<div class="clue-container w-full overflow-x-auto overflow-y-hidden">
    <div class="mx-auto grid gap-x-1.5 gap-y-2 py-2 md:p-2"
         style="grid-template-columns: 66px 76px 76px 84px 104px 128px;">
        <!-- Headers -->
        {#each ["dish", "energy", "price", "ingredients", "source", "buffs"] as h}
            <div class="min-h-9 flex items-center justify-center px-0.5">
                <span class="text-xs md:text-sm leading-[1.05] text-center stardew-text">{locale.t(`pages.dish.attributes.headers.${h}` as any)}</span>
            </div>
        {/each}

        {#each attempts.slice().reverse() as attempt}
            <!-- Dish icon -->
            <div class="h-18 w-full sv-slot flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8));">
                <img src={media(`/dishes/${attempt.dish.key}.png`)} alt={attempt.dish.name}
                     title={attempt.dish.name}
                     class="w-12 h-12 object-contain" style="image-rendering: pixelated;"/>
            </div>

            <!-- Energy -->
            <div class="square-{attempt.dish.id} h-18 w-full relative sv-cell flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.energy === 'HIGHER'} class:arrow-down={attempt.differences.energy === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.energy)}; visibility: {animations[attempt.dish.id] === undefined || animations[attempt.dish.id] > 0 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg stardew-text">{attempt.dish.energy}</span>
            </div>

            <!-- Price -->
            <div class="square-{attempt.dish.id} h-18 w-full relative sv-cell flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.price === 'HIGHER'} class:arrow-down={attempt.differences.price === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.price)}; visibility: {animations[attempt.dish.id] === undefined || animations[attempt.dish.id] > 1 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-sm stardew-text">{attempt.dish.price}g</span>
            </div>

            <!-- Ingredients -->
            <div class="square-{attempt.dish.id} h-18 w-full relative sv-cell flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.ingredients === 'HIGHER'} class:arrow-down={attempt.differences.ingredients === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.ingredients)}; visibility: {animations[attempt.dish.id] === undefined || animations[attempt.dish.id] > 2 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg stardew-text">{attempt.dish.ingredients}</span>
            </div>

            <!-- Source -->
            <div class="square-{attempt.dish.id} h-18 w-full relative sv-cell flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.source)}; visibility: {animations[attempt.dish.id] === undefined || animations[attempt.dish.id] > 3 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words leading-tight">{translate('source', attempt.dish.source)}</span>
            </div>

            <!-- Buffs -->
            <div class="square-{attempt.dish.id} h-18 w-full relative sv-cell flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); --status: {getBackgroundColor(attempt.differences.buffs)}; visibility: {animations[attempt.dish.id] === undefined || animations[attempt.dish.id] > 4 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words leading-tight">{buffsText(attempt.dish.buffs)}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    .arrow-container { position: relative; }

    @keyframes flipInY {
        from { transform: perspective(400px) rotate3d(0,1,0,90deg); animation-timing-function: ease-in; opacity: 0; }
        40% { transform: perspective(400px) rotate3d(0,1,0,-20deg); animation-timing-function: ease-in; }
        60% { transform: perspective(400px) rotate3d(0,1,0,10deg); opacity: 1; }
        80% { transform: perspective(400px) rotate3d(0,1,0,-5deg); }
        to { transform: perspective(400px); }
    }
    .animate__animated { animation-duration: 1s; animation-fill-mode: both; }
    .animate__flipInY { backface-visibility: visible !important; animation-name: flipInY; }
</style>
