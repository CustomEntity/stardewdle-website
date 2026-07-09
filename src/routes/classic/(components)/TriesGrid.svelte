<!-- TriesGrid.svelte -->
<script lang="ts">
    import {useClassicGameData} from "$lib/stores/classicGameData.svelte";
    import {onMount, tick} from "svelte";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        dailyVillager: Villager;
        villagers: Villager[];
    }

    const {dailyVillager, villagers}: Props = $props();
    const classicGameData = useClassicGameData();

    // Animation state tracking
    let animations: Record<string, number> = $state({});
    let initialAttemptsCount = $state(-1);

    onMount(() => {
        attempts.forEach(attempt => {
            animations[attempt.villager.id] = 6;
        });
        initialAttemptsCount = attempts.length;
    });

    // Age is ordinal: Child < Teen < Adult
    const ageOrder: Record<string, number> = {
        'Child': 1,
        'Teen': 2,
        'Adult': 3
    };

    const compareOrdinal = (value: string, target: string, orderMap: Record<string, number>) => {
        const valueOrder = orderMap[value] || 0;
        const targetOrder = orderMap[target] || 0;

        if (valueOrder === targetOrder) return 'CORRECT';
        if (valueOrder < targetOrder) return 'HIGHER';
        return 'LOWER';
    };

    const compareNumber = (value: number, target: number) => {
        if (value === target) return 'CORRECT';
        return value > target ? 'LOWER' : 'HIGHER';
    };

    // Derived attempts with per-column comparison
    const attempts = $derived(classicGameData?.tries.map(tryId => {
        const villager = villagers.find(v => v.id === tryId);
        if (!villager) return null;

        return {
            villager,
            differences: {
                gender: villager.gender === dailyVillager.gender ? 'CORRECT' : 'INCORRECT',
                region: villager.region === dailyVillager.region ? 'CORRECT' : 'INCORRECT',
                season: villager.birth_season === dailyVillager.birth_season ? 'CORRECT' : 'INCORRECT',
                birthday: compareNumber(villager.birth_day, dailyVillager.birth_day),
                marriageable: villager.marriageable === dailyVillager.marriageable ? 'CORRECT' : 'INCORRECT',
                age: compareOrdinal(villager.age, dailyVillager.age, ageOrder)
            }
        };
    }).filter(Boolean));

    let isInitialLoad = $state(true);
    let previousLength = $state(0);

    $effect(() => {
        const currentLength = attempts.length;
        if (initialAttemptsCount === -1) return;

        if (currentLength > initialAttemptsCount) {
            const newAttempts = attempts.slice(initialAttemptsCount);
            newAttempts.forEach(attempt => {
                if (!attempt) return;
                handleNewAttempt(attempt.villager.id);
            });
            initialAttemptsCount = currentLength;
        }
    });

    async function handleNewAttempt(villagerId: number) {
        animations[villagerId] = 0;
        await tick();

        const squares = document.getElementsByClassName(`square-${villagerId}`);
        for (let i = 0; i < squares.length; i++) {
            setTimeout(() => {
                const square = squares[i] as HTMLElement;
                square.classList.add('animate__animated', 'animate__flipInY');
                animations[villagerId]++;
            }, i * 700);
        }
    }

    // portrait cell background — subtle per-region tint (faces are opaque, so this is a soft accent)
    const regionColors: { [key: string]: string } = {
        'Town': '#7cb342',
        'Mountain': '#8d6e63',
        'Forest': '#2e7d32',
        'Beach': '#4fc3f7',
        'Desert': '#fbc02d',
        'Sewers': '#546e7a',
        'Ginger Island': '#26a69a'
    };
    const backgroundColor = (villager: Villager): string => regionColors[villager.region] || '#caa472';

    const getBackgroundColor = (status: string) => {
        switch (status) {
            case 'CORRECT':
                return '#32c21c';
            case 'INCORRECT':
                return '#d40c00';
            case 'PARTIALLY-CORRECT':
                return '#E1812D';
            default:
                return '#d40c00';
        }
    }

    // translate an enum value against pages.classic.attributes.<group>.<value>,
    // falling back to a prettified raw value
    const translate = (group: string, value: string | null) => {
        if (!value) return '-';
        const slug = value.replace(/\s+/g, '');
        const key = `pages.classic.attributes.${group}.${slug}` as const;
        const translated = locale.t(key as any);
        return translated === key ? value : translated;
    }

    const translateMarriageable = (value: boolean) =>
        translate('marriageable', value ? 'yes' : 'no');
</script>

<div class="clue-container w-full overflow-x-auto overflow-y-hidden">
    <div class="min-w-[420px] grid grid-cols-7 gap-x-19 md:gap-x-1 gap-y-2 py-2 md:p-2">
        <!-- Headers -->
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.villager')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.gender')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.region')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.season')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.birthday')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.marriageable')}
            </span>
        </div>
        <div class="w-18 h-8 flex items-center justify-center">
            <span class="text-sm md:text-lg stardew-text">
                {locale.t('pages.classic.attributes.headers.age')}
            </span>
        </div>

        <!-- Grid Content -->
        {#each attempts.slice().reverse() as attempt}

            <!-- Villager Portrait -->
            <div class="size-18 sv-tile"
                 style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {backgroundColor(attempt.villager)};">
                <img src={attempt.villager.portrait_url}
                     alt={attempt.villager.name}
                     class="w-full h-full object-cover"/>
            </div>

            <!-- Gender -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center"
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.gender)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 0 ? 'visible' : 'hidden'}">
                <span class="z-10 text-white text-xs text-center break-words overflow-hidden px-1 w-full stardew-text">
                    {translate('gender', attempt.villager.gender)}
                </span>
            </div>

            <!-- Region -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center"
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.region)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 1 ? 'visible' : 'hidden'}">
                <span class="z-10 text-white text-xs text-center break-words overflow-hidden px-1 w-full stardew-text">
                    {translate('region', attempt.villager.region)}
                </span>
            </div>

            <!-- Birth Season -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center"
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.season)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 2 ? 'visible' : 'hidden'}">
                <span class="z-10 text-white text-xs text-center break-words overflow-hidden px-1 w-full stardew-text">
                    {translate('season', attempt.villager.birth_season)}
                </span>
            </div>

            <!-- Birthday (day number) -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center arrow-container"
                    class:arrow-up={attempt.differences.birthday === 'HIGHER'}
                    class:arrow-down={attempt.differences.birthday === 'LOWER'}
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.birthday)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 3 ? 'visible' : 'hidden'};">
    <span class="z-10 text-white text-lg text-center break-words overflow-hidden px-1 w-full stardew-text">
        {attempt.villager.birth_day}
    </span>
            </div>

            <!-- Marriageable -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center"
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.marriageable)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 4 ? 'visible' : 'hidden'};">
    <img src="/ui/heart.png" alt={translateMarriageable(attempt.villager.marriageable)} title={translateMarriageable(attempt.villager.marriageable)}
         class="z-10 w-9 h-9 object-contain"
         style="image-rendering: pixelated; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.4)); {attempt.villager.marriageable ? '' : 'filter: grayscale(1) brightness(1.5) opacity(0.5) drop-shadow(0 2px 0 rgba(0,0,0,0.3));'}"/>
            </div>

            <!-- Age -->
            <div
                    class="square-{attempt.villager.id} size-18 relative sv-tile flex items-center justify-center arrow-container"
                    class:arrow-up={attempt.differences.age === 'HIGHER'}
                    class:arrow-down={attempt.differences.age === 'LOWER'}
                    style="    filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.8)); background-color: {getBackgroundColor(attempt.differences.age)}; visibility: {animations[attempt.villager.id] === undefined || animations[attempt.villager.id] > 5 ? 'visible' : 'hidden'};">
    <span class="z-10 text-white text-xs text-center break-words overflow-hidden px-1 w-full stardew-text">
        {translate('age', attempt.villager.age)}
    </span>
            </div>
        {/each}
    </div>
</div>

<style>

    .arrow-container {
        position: relative;
    }

    .arrow-container.arrow-up::before,
    .arrow-container.arrow-down::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url('/arrow.png');
        background-position: center;
        background-size: cover;
        pointer-events: none;
        z-index: 0;
    }

    .arrow-container.arrow-down::before {
        transform: rotate(180deg);
    }

    @keyframes flipInY {
        from {
            transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
            animation-timing-function: ease-in;
            opacity: 0;
        }

        40% {
            transform: perspective(400px) rotate3d(0, 1, 0, -20deg);
            animation-timing-function: ease-in;
        }

        60% {
            transform: perspective(400px) rotate3d(0, 1, 0, 10deg);
            opacity: 1;
        }

        80% {
            transform: perspective(400px) rotate3d(0, 1, 0, -5deg);
        }

        to {
            transform: perspective(400px);
        }
    }

    .animate__animated {
        animation-duration: 1s;
        animation-fill-mode: both;
    }

    .animate__flipInY {
        backface-visibility: visible !important;
        animation-name: flipInY;
    }

    @media (max-width: 768px) {
        .clue-container {
            max-width: 100%;
            overflow-x: auto;
        }
    }
</style>
