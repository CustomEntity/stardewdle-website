<script lang="ts">
    import { tick } from "svelte";
    import ExplanationBox from "$lib/components/ExplanationBox.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import ShareContainer from "$lib/components/ShareContainer.svelte";
    import { WEBSITE_URL } from "$lib/constants";
    import { media } from "$lib/media";
    import VictoryContainer from "$lib/components/VictoryContainer.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
    import StatsModal from "./(components)/StatsModal.svelte";
    import locale from "$lib/stores/locale.svelte";
    import { Confetti } from "svelte-confetti";
    import MarvelRivalsButton from "$lib/components/buttons/MarvelRivalsButton.svelte";
    import DishToolsBar from "./(components)/DishToolsBar.svelte";
    import { useDishGameData } from "$lib/stores/dishGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import DishGrid from "./(components)/DishGrid.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const dishGameData = useDishGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();
    let innerWidth = 0;

    const BG = "#e8d3a0";

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.dish.share.text", { id: gameId, tries: triesCount });
    }
    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.dish.share.to_copy", { id: gameId, tries: triesCount, url: "https://" + WEBSITE_URL });
    }

    async function handleSelect(dishName: string) {
        const [dishes, daily] = await Promise.all([data?.dishes, data?.daily]);
        if (!daily) return;
        const dish = dishes.find((d) => d.name === dishName);
        if (!dish) return;
        dishGameData.addTry(dish.id);
        if (dish.id === daily.dish.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            dishGameData.win();
            notifyModeComplete("dish", { won: true, attempts: dishGameData.tries.length });
        }
    }

    data?.daily?.then((dailyGame) => {
        if (!dailyGame) return;
        if (dailyGame.game_id !== dishGameData.game) dishGameData.resetTries(dailyGame.game_id);
        if (dishGameData.tries.includes(dailyGame.dish.id)) isWon = true;
    });

    const compareNumber = (v: number, t: number) => (v === t ? "CORRECT" : v > t ? "LOWER" : "HIGHER");
    const compareBuffs = (a: string[], b: string[]) => {
        const sb = new Set(b);
        const inter = a.filter((s) => sb.has(s));
        if (a.length === b.length && inter.length === a.length) return "CORRECT";
        if (inter.length > 0) return "PARTIALLY-CORRECT";
        return "INCORRECT";
    };
</script>

<svelte:window bind:innerWidth />
{#if isWon}
    <div style="position:fixed;top:-50px;left:0;height:100vh;width:100vw;display:flex;justify-content:center;overflow:hidden;pointer-events:none;">
        <Confetti colorArray={['#e0912f','#f0c04a','#d94f3b','#e6c485','#8a5a2b','#c9863c']} x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh"/>
    </div>
{/if}
<div class="flex flex-col items-center w-full gap-6">
    <DishToolsBar patchNotes={data.patchNotes} gameData={dishGameData.data} />

    {#await Promise.all([data?.dishes, data?.daily])}
        <div class="flex justify-center w-full mt-8"><Spinner /></div>
    {:then [dishes, daily]}
        <ExplanationBox title={locale.t("pages.dish.components.explanationBox.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t("pages.dish.components.explanationBox.title")}
                    </span>
                    {#if dishGameData.tries.length === 0}
                        <span class="block mt-2 text-lg text-white/70">
                            {locale.t("pages.dish.components.explanationBox.bottomHint")}
                        </span>
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.dish.errors.generic_error", { message: error.message })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[600px]">
        {#await Promise.all( [data?.dishes, data?.daily, data?.yesterday], ) then [dishes, daily, yesterdayDish]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.dish.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !dishGameData.tries.includes(dishes.find((d) => d.name === option)?.id)}
                            options={dishes?.map((d) => d.name)}
                            placeholder={locale.t("pages.dish.components.answerInput.placeholder")}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const dish = dishes.find((d) => d.name === option)}
                                <span class="flex items-center gap-2">
                                    <img src={media(`/dishes/${dish?.key}.png`)} alt={option}
                                         style="background-color: {BG}; image-rendering: pixelated;"
                                         class="size-10 object-contain p-1"/>
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    <div class="flex flex-col items-center w-full gap-4">
                        <DishGrid {dishes} dailyDish={daily.dish} />
                        {#if innerWidth <= 768}
                            <p class="text-gray-300">{locale.t("pages.dish.scroll_hint")}</p>
                        {/if}
                    </div>
                </div>
                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10">
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.dish.name}
                            imageUrl={media(`/dishes/${daily.dish.key}.png`)}
                            imageAlt={daily.dish.name}
                            triesCount={dishGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={dishGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton slant="none" onClick={toggleModal} width="150px" height="49px"
                                            title={locale.t("pages.dish.victory.stats_button")}></MarvelRivalsButton>
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <HomeButton
                                    class="w-full max-w-[380px] h-[96px] mt-1"
                                    title={locale.t("pages.home.button.villager.title")}
                                    subtitle={locale.t("pages.home.button.villager.description")}
                                    gameMode="villager"
                                    href="/villager"/>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(daily.game_id, dishGameData.tries.length)}
                            class="w-full"
                            text={getShareText(daily.game_id, dishGameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                            tries={dishGameData.tries
                                .map((tryId) => {
                                    const dish = dishes.find((d) => d.id === tryId);
                                    if (!dish) return null;
                                    return {
                                        energy: compareNumber(dish.energy, daily.dish.energy),
                                        price: compareNumber(dish.price, daily.dish.price),
                                        ingredients: compareNumber(dish.ingredients, daily.dish.ingredients),
                                        source: dish.source === daily.dish.source ? "CORRECT" : "INCORRECT",
                                        buffs: compareBuffs(dish.buffs, daily.dish.buffs),
                                    };
                                })
                                .filter(Boolean)}
                        />
                    </div>
                {/if}
                {#if yesterdayDish}
                    {@const formattedText = locale.t("pages.dish.yesterday", { prefix: "", gameId: yesterdayDish.game_id, brawlerName: yesterdayDish.name })}
                    <span class="flex gap-2 text-xl mt-6 stardew-text">
                        {@html formattedText
                            .replace(/<name>(.*?)<\/name>/g, '<span class="text-xl stardew-text text-[#6cae3f]!">$1</span>')
                            .replace(/^(.*?)(?=<span|$)/, '<span class="text-white">$1</span>')}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>
