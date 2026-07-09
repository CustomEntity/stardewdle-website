<!-- FishGrid.svelte -->
<script lang="ts">
    import { useFishGameData } from "$lib/stores/fishGameData.svelte";
    import { onMount, tick } from "svelte";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        dailyFish: Fish;
        fish: Fish[];
    }

    const { dailyFish, fish }: Props = $props();
    const fishGameData = useFishGameData();

    let animations: Record<string, number> = $state({});
    let initialAttemptsCount = $state(-1);

    onMount(() => {
        attempts.forEach((a) => (animations[a.fish.id] = 5));
        initialAttemptsCount = attempts.length;
    });

    const compareNumber = (value: number, target: number) => {
        if (value === target) return "CORRECT";
        return value > target ? "LOWER" : "HIGHER";
    };
    const compareSeasons = (a: string[], b: string[]) => {
        const sb = new Set(b);
        const inter = a.filter((s) => sb.has(s));
        if (a.length === b.length && inter.length === a.length) return "CORRECT";
        if (inter.length > 0) return "PARTIALLY-CORRECT";
        return "INCORRECT";
    };

    const attempts = $derived(
        fishGameData?.tries
            .map((tryId) => {
                const f = fish.find((x) => x.id === tryId);
                if (!f) return null;
                return {
                    fish: f,
                    differences: {
                        difficulty: compareNumber(f.difficulty, dailyFish.difficulty),
                        behavior: f.behavior === dailyFish.behavior ? "CORRECT" : "INCORRECT",
                        season: compareSeasons(f.seasons, dailyFish.seasons),
                        weather: f.weather === dailyFish.weather ? "CORRECT" : "INCORRECT",
                        size: compareNumber(f.maxSize, dailyFish.maxSize),
                    },
                };
            })
            .filter(Boolean),
    );

    $effect(() => {
        const currentLength = attempts.length;
        if (initialAttemptsCount === -1) return;
        if (currentLength > initialAttemptsCount) {
            attempts.slice(initialAttemptsCount).forEach((a) => a && handleNewAttempt(a.fish.id));
            initialAttemptsCount = currentLength;
        }
    });

    async function handleNewAttempt(fishId: number) {
        animations[fishId] = 0;
        await tick();
        const squares = document.getElementsByClassName(`square-${fishId}`);
        for (let i = 0; i < squares.length; i++) {
            setTimeout(() => {
                (squares[i] as HTMLElement).classList.add("animate__animated", "animate__flipInY");
                animations[fishId]++;
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
        const key = `pages.fish.attributes.${group}.${value.replace(/\s+/g, "")}` as const;
        const t = locale.t(key as any);
        return t === key ? value : t;
    };
    const seasonsText = (seasons: string[]) => seasons.map((s) => translate("season", s)).join(" / ") || "—";
</script>

<div class="clue-container w-full overflow-x-auto overflow-y-hidden">
    <div class="min-w-[440px] grid grid-cols-6 gap-x-1 gap-y-2 py-2 md:p-2">
        {#each ["fish", "difficulty", "behavior", "season", "weather", "size"] as h}
            <div class="w-18 h-8 flex items-center justify-center">
                <span class="text-sm md:text-lg stardew-text">{locale.t(`pages.fish.attributes.headers.${h}` as any)}</span>
            </div>
        {/each}

        {#each attempts.slice().reverse() as attempt}
            <!-- Fish icon -->
            <div class="size-18 sv-tile flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color:#a4c8e0;">
                <img src={`/fish/${attempt.fish.key}.png`} alt={attempt.fish.name} title={attempt.fish.name}
                     class="w-12 h-12 object-contain" style="image-rendering: pixelated;"/>
            </div>

            <!-- Difficulty -->
            <div class="square-{attempt.fish.id} size-18 relative sv-tile flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.difficulty === 'HIGHER'} class:arrow-down={attempt.differences.difficulty === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.difficulty)}; visibility: {animations[attempt.fish.id] === undefined || animations[attempt.fish.id] > 0 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg stardew-text">{attempt.fish.difficulty}</span>
            </div>

            <!-- Behavior -->
            <div class="square-{attempt.fish.id} size-18 relative sv-tile flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.behavior)}; visibility: {animations[attempt.fish.id] === undefined || animations[attempt.fish.id] > 1 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words">{translate('behavior', attempt.fish.behavior)}</span>
            </div>

            <!-- Season -->
            <div class="square-{attempt.fish.id} size-18 relative sv-tile flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.season)}; visibility: {animations[attempt.fish.id] === undefined || animations[attempt.fish.id] > 2 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-xs stardew-text px-1 text-center break-words leading-tight">{seasonsText(attempt.fish.seasons)}</span>
            </div>

            <!-- Weather -->
            <div class="square-{attempt.fish.id} size-18 relative sv-tile flex items-center justify-center"
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.weather)}; visibility: {animations[attempt.fish.id] === undefined || animations[attempt.fish.id] > 3 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-sm stardew-text px-1 text-center">{translate('weather', attempt.fish.weather)}</span>
            </div>

            <!-- Size -->
            <div class="square-{attempt.fish.id} size-18 relative sv-tile flex items-center justify-center arrow-container"
                 class:arrow-up={attempt.differences.size === 'HIGHER'} class:arrow-down={attempt.differences.size === 'LOWER'}
                 style="filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.size)}; visibility: {animations[attempt.fish.id] === undefined || animations[attempt.fish.id] > 4 ? 'visible' : 'hidden'};">
                <span class="z-10 text-white text-lg stardew-text">{attempt.fish.maxSize}"</span>
            </div>
        {/each}
    </div>
</div>

<style>
    .arrow-container { position: relative; }
    .arrow-container.arrow-up::before, .arrow-container.arrow-down::before {
        content: ''; position: absolute; inset: 0;
        background-image: url('/arrow.png'); background-position: center; background-size: cover;
        pointer-events: none; z-index: 0;
    }
    .arrow-container.arrow-down::before { transform: rotate(180deg); }
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
