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
    import { usePixelGameData } from "$lib/stores/pixelGameData.svelte";
    import AnswerInput from "$lib/components/AnswerInput.svelte";
    import PixelToolsBar from "./(components)/PixelToolsBar.svelte";
    import { notifyModeComplete } from "$lib/stores/alldle.svelte";

    const { data } = $props();
    const pixelGameData = usePixelGameData();
    let isWon = $state(false);
    let wonDivElement: HTMLDivElement | undefined = $state();
    let innerWidth = 0;
    let canvasElement: HTMLCanvasElement | undefined = $state();
    let imageLoaded = $state(false);

    const BG = "#caa472";

    // pixel resolution grows with each guess (source portraits are 64px, so the
    // meaningful reveal is 2..64; higher values just upscale the full face)
    function getPixelResolution(triesCount: number, isWon: boolean): number {
        if (isWon) return 256;
        const resolutions = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];
        return resolutions[Math.min(triesCount, resolutions.length - 1)];
    }

    function drawPixelatedImage(imageUrl: string, resolution: number) {
        if (!canvasElement) return;
        const canvas = canvasElement;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            const displaySize = 256;
            canvas.width = displaySize;
            canvas.height = displaySize;

            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
            if (!tempCtx) return;
            tempCanvas.width = resolution;
            tempCanvas.height = resolution;

            // full square face -> low-res buffer
            tempCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, resolution, resolution);

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, resolution, resolution, 0, 0, displaySize, displaySize);
            imageLoaded = true;
        };
        img.onerror = (e) => console.error("Failed to load image:", imageUrl, e);
        img.src = imageUrl;
    }

    let currentImageUrl = $state<string>("");
    let canvasReady = $state(false);

    $effect(() => {
        if (canvasElement && !canvasReady) canvasReady = true;
    });

    $effect(() => {
        data?.daily?.then((daily) => {
            if (daily && daily.villager.portrait_url !== currentImageUrl) {
                currentImageUrl = daily.villager.portrait_url;
            }
        });
    });

    $effect(() => {
        if (canvasReady && currentImageUrl) {
            const resolution = getPixelResolution(pixelGameData.tries.length, isWon);
            drawPixelatedImage(currentImageUrl, resolution);
        }
    });

    function getShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.pixel.share.text", { id: gameId, tries: triesCount });
    }
    function getCopyShareText(gameId: number, triesCount: number): string {
        return locale.t("pages.pixel.share.to_copy", {
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

        pixelGameData.addTry(villager.id);
        if (villager.id === daily.villager.id) {
            isWon = true;
            await tick();
            wonDivElement?.scrollIntoView({ behavior: "smooth" });
            pixelGameData.win();
            notifyModeComplete("pixel", { won: true, attempts: pixelGameData.tries.length });
        }
    }

    // Initialisation
    data?.daily?.then((dailyGame) => {
        if (!dailyGame) return;
        if (dailyGame.game_id !== pixelGameData.game) {
            pixelGameData.resetTries(dailyGame.game_id);
        }
        if (pixelGameData.tries.includes(dailyGame.villager.id)) isWon = true;
    });
</script>

<svelte:window bind:innerWidth />
{#if isWon}
    <div
        style="
position: fixed;
top: -50px;
left: 0;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
overflow: hidden;
pointer-events: none;"
    >
        <Confetti colorArray={['#5aa02f','#7bc74d','#ffd24a','#e6c485','#8a5a2b','#c9863c']} x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration={5000} amount={100} fallDistance="100vh" />
    </div>
{/if}
<div class="flex flex-col items-center w-full gap-6">
    <PixelToolsBar patchNotes={data.patchNotes} gameData={pixelGameData.data} />

    {#await Promise.all([data?.villagers, data?.daily])}
        <div class="flex justify-center w-full mt-8">
            <Spinner />
        </div>
    {:then [villagers, daily]}
        <ExplanationBox title={locale.t("pages.pixel.components.explanationBox.title")}>
            {#snippet content()}
                <div class="relative w-full text-center text-white">
                    <span class="uppercase text-2xl font-normal leading-none">
                        {locale.t("pages.pixel.components.explanationBox.title")}
                    </span>
                </div>
                <div class="flex flex-col items-center w-full mt-6">
                    {#if daily?.villager.portrait_url}
                        {@const currentResolution = getPixelResolution(pixelGameData.tries.length, isWon)}
                        <div
                            class="relative w-64 h-64 rounded-lg overflow-hidden shadow-2xl"
                            style="background-color: {BG};"
                        >
                            <canvas
                                bind:this={canvasElement}
                                class="w-full h-full"
                                style="image-rendering: pixelated; image-rendering: crisp-edges;"
                            ></canvas>
                            {#if !imageLoaded}
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <Spinner />
                                </div>
                            {/if}
                        </div>
                        <p class="text-gray-300 text-sm mt-4">
                            {currentResolution}×{currentResolution}
                        </p>
                    {/if}
                </div>
            {/snippet}
        </ExplanationBox>
    {:catch error}
        <p class="text-[#e6cc8f] text-lg font-poppins tracking-wide">
            {locale.t("pages.pixel.errors.generic_error", { message: error.message })}
        </p>
    {/await}

    <div class="flex flex-col items-center w-full md:max-w-[570px]">
        {#await Promise.all( [data?.villagers, data?.daily, data?.yesterday], ) then [villagers, daily, yesterdayPixel]}
            {#if !daily}
                <p class="text-white text-lg font-poppins tracking-wide">
                    {locale.t("pages.pixel.errors.no_daily_brawler")}
                </p>
            {:else}
                <div class="flex flex-col items-center w-full gap-4">
                    {#if !isWon}
                        <AnswerInput
                            id="answerInput"
                            filter={(option, searchTerm) =>
                                option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !pixelGameData.tries.includes(
                                    villagers.find((v) => v.name === option)?.id,
                                )}
                            options={villagers?.map((v) => v.name)}
                            placeholder={locale.t("pages.pixel.components.answerInput.placeholder")}
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

                    {#if pixelGameData.tries.length > 0}
                        <div class="flex flex-col items-center w-full gap-3 mt-4">
                            <div class="flex flex-wrap justify-center gap-3 w-full">
                                {#each pixelGameData.tries.slice().reverse() as tryId}
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
                            triesCount={pixelGameData.tries.length}
                            bind:container={wonDivElement}
                        >
                            {#snippet statsButton()}
                                <StatsModal stats={pixelGameData.data.stats}>
                                    {#snippet button(toggleModal)}
                                        <MarvelRivalsButton
                                            slant="none"
                                            onClick={toggleModal}
                                            width="150px"
                                            height="49px"
                                            title={locale.t("pages.pixel.victory.stats_button")}
                                        ></MarvelRivalsButton>
                                    {/snippet}
                                </StatsModal>
                            {/snippet}
                            {#snippet nextMode()}
                                <a
                                    href="/classic"
                                    class="stardew-text text-lg text-[#e6cc8f] underline underline-offset-4 hover:text-white"
                                >
                                    {locale.t("pages.pixel.victory.next_mode")}
                                </a>
                            {/snippet}
                        </VictoryContainer>
                        <ShareContainer
                            copyText={getCopyShareText(daily.game_id, pixelGameData.tries.length)}
                            class="w-full"
                            text={getShareText(daily.game_id, pixelGameData.tries.length)}
                            websiteUrl={WEBSITE_URL}
                        />
                    </div>
                {/if}
                {#if yesterdayPixel}
                    {@const formattedText = locale.t("pages.pixel.yesterday", {
                        prefix: "",
                        gameId: yesterdayPixel.game_id,
                        brawlerName: yesterdayPixel.villager_name,
                    })}
                    <span class="flex gap-2 text-xl mt-6 stardew-text">
                        {@html formattedText
                            .replace(
                                /<name>(.*?)<\/name>/g,
                                '<span class="text-xl stardew-text text-[#6cae3f]!">$1</span>',
                            )
                            .replace(/^(.*?)(?=<span|$)/, '<span class="text-white">$1</span>')}
                    </span>
                {/if}
            {/if}
        {/await}
    </div>
</div>

<style>
    canvas {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }
</style>
