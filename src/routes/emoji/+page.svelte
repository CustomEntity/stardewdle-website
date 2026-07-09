<script lang="ts">
    import { tick } from "svelte";
    import ExplanationBox from "$lib/components/ExplanationBox.svelte";
    import Spinner from "$lib/components/spinner/Spinner.svelte";
    import ShareContainer from "$lib/components/ShareContainer.svelte";
    import { WEBSITE_URL } from "$lib/constants";
    import VictoryContainer from "$lib/components/VictoryContainer.svelte";
    import StatsModal from "./(components)/StatsModal.svelte";
    import locale from "$lib/stores/locale.svelte";
    import { Confetti } from "svelte-confetti";
    import MarvelRivalsButton from "$lib/components/buttons/MarvelRivalsButton.svelte";
    import EmojiToolsBar from "./(components)/EmojiToolsBar.svelte";
    import { useEmojiGameData } from "$lib/stores/emojiGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const emojiGameData = useEmojiGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();

    const BG = "#caa472";

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.emoji.share.text", { id: gameId, tries: triesCount });
    }
    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.emoji.share.to_copy", {
            id: gameId,
            tries: triesCount,
            url: "https://" + WEBSITE_URL,
        });
    }

    async function handleSelect(villagerName: string) {
        const [villagers, daily] = await Promise.all([data?.villagers, data?.daily]);
        if (!daily) return;
        const villager = villagers.find((v) => v.name === villagerName);
        if (!villager) return;

        emojiGameData.addTry(villager.id);
        if (villager.id === daily.villager.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            emojiGameData.win();
            notifyModeComplete("emoji", { won: true, attempts: emojiGameData.tries.length });
        }
    }

    data?.daily?.then((dailyGame) => {
        if (!dailyGame) return;
        if (dailyGame.game_id !== emojiGameData.game) {
            emojiGameData.resetTries(dailyGame.game_id);
        }
        if (emojiGameData.tries.includes(dailyGame.villager.id)) isWon = true;
    });
</script>

{#if isWon}
    <div style="position:fixed;top:-50px;left:0;height:100vh;width:100vw;display:flex;justify-content:center;overflow:hidden;pointer-events:none;">
        <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh"/>
    </div>
{/if}

<div class="flex flex-col items-center w-full gap-6">
    <EmojiToolsBar patchNotes={data.patchNotes} gameData={emojiGameData.data}/>

    {#await Promise.all([data?.villagers, data?.daily])}
        <div class="flex justify-center w-full mt-8">
            <Spinner/>
        </div>
    {:then [villagers, daily]}
        <ExplanationBox title={locale.t("pages.emoji.components.explanationBox.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t("pages.emoji.components.explanationBox.title")}
                    </span>
                </div>
                <div class="flex flex-col items-center w-full mt-6">
                    {#if daily?.emojis}
                        {@const emojisToShow = Math.min(emojiGameData.tries.length + 1, daily.emojis.length)}
                        <div class="flex gap-4 justify-center">
                            {#each daily.emojis.slice(0, emojisToShow) as emojiItem}
                                <span class="text-6xl">{emojiItem.emoji}</span>
                            {/each}
                            {#each Array(daily.emojis.length - emojisToShow) as _}
                                <span class="text-6xl opacity-20">❓</span>
                            {/each}
                        </div>
                        {#if !isWon && emojiGameData.tries.length < daily.emojis.length - 1}
                            <p class="text-white/60 text-sm mt-3 stardew-text">
                                {locale.t("pages.emoji.components.explanationBox.next_emoji_hint", {
                                    tries: emojiGameData.tries.length + 1
                                })}
                            </p>
                        {/if}
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.emoji.errors.generic_error", { message: error.message })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[570px]">
        {#await Promise.all([data?.villagers, data?.daily, data?.yesterday]) then [villagers, daily, yesterdayEmoji]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.emoji.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !emojiGameData.tries.includes(villagers.find((v) => v.name === option)?.id)}
                            options={villagers?.map((v) => v.name)}
                            placeholder={locale.t("pages.emoji.components.answerInput.placeholder")}
                            onselect={handleSelect}
                        >
                            {#snippet item(option)}
                                {@const villager = villagers.find((v) => v.name === option)}
                                <span class="flex items-center gap-2">
                                    <img
                                        src={villager?.portrait_url}
                                        alt={option}
                                        style="background-color: {BG};"
                                        class="size-10 object-cover"
                                    />
                                    {option}
                                </span>
                            {/snippet}
                        </AnswerInput>
                    {/if}

                    {#if emojiGameData.tries.length > 0}
                        <div class="flex flex-col items-center w-full gap-3 mt-4">
                            <div class="flex flex-wrap justify-center gap-3 w-full">
                                {#each emojiGameData.tries.slice().reverse() as tryId}
                                    {@const tried = villagers.find((v) => v.id === tryId)}
                                    {@const isCorrect = tryId === daily.villager.id}
                                    {#if tried}
                                        <div
                                            class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-800/50 border-2 transition-all hover:scale-105"
                                            style="border-color: {isCorrect ? '#a5ff00' : '#ff3344'};"
                                        >
                                            <img
                                                src={tried.portrait_url}
                                                alt={tried.name}
                                                style="background-color: {BG};"
                                                class="w-20 h-20 object-cover rounded-lg"
                                            />
                                            <p class="text-white font-bold text-sm text-center stardew-text">
                                                {tried.name}
                                            </p>
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                {#if isWon}
                    <div class="flex flex-col items-center w-full gap-10">
                        <VictoryContainer
                            class="w-full mt-8"
                            name={daily.villager.name}
                            imageUrl={villagers.find((v) => v.id === daily.villager.id)?.portrait_url}
                            imageAlt={daily.villager.name}
                            triesCount={emojiGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={emojiGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton
                                            slant="none"
                                            onClick={toggleModal}
                                            width="150px"
                                            height="49px"
                                            title={locale.t("pages.emoji.victory.stats_button")}
                                        />
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(daily.game_id, emojiGameData.tries.length)}
                            class="w-full"
                            text={getShareText(daily.game_id, emojiGameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                        />
                    </div>
                {/if}

                {#if yesterdayEmoji}
                    {@const formattedText = locale.t("pages.emoji.yesterday", {
                        prefix: "",
                        gameId: yesterdayEmoji.game_id,
                        brawlerName: yesterdayEmoji.villager_name,
                    })}
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
