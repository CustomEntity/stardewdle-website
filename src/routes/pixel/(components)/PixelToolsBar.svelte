<script lang="ts">
    import ToolsBar from "$lib/components/ToolsBar.svelte";
    import StatsModal from "./StatsModal.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import PatchNotesModal from "./PatchNotesModal.svelte";
    import type {PatchNote} from "../+page.server";
    import locale from "$lib/stores/locale.svelte";
    import StylizedModal from "$lib/components/StylizedModal.svelte";
    import type {PixelGameData} from "$lib/stores/pixelGameData.svelte";

    interface Props {
        gameData: PixelGameData;
        patchNotes: Promise<PatchNote[]>;
    }

    const {gameData, patchNotes}: Props = $props();
</script>

<ToolsBar>
    <StatsModal stats={gameData.stats}>
        {#snippet button(toggleModal)}
            <button
                    onclick={toggleModal}
                    class="cursor-pointer size-[32px] hover:fill-[#fff] duration-300">
                <Tooltip text={locale.t('pages.pixel.components.toolsBar.stats.tooltip')}>
                    <img src="/toolsbar/stats.png"
                         class="w-full h-full object-fit pixelated opacity-70 hover:opacity-100"
                         alt={locale.t('pages.pixel.components.toolsBar.stats.alt')}/>
                </Tooltip>
            </button>
        {/snippet}
    </StatsModal>

    {@const streak = gameData.stats.current_streak}
    <button class="w-8 fill-[#C3C1C1] hover:fill-[#fff] duration-300 relative bottom-[3px]">
        <Tooltip
                maxWidth={150}
                text={locale.t('pages.pixel.components.toolsBar.streak.tooltip')}>
            {#if streak > 0}
                <img src="/toolsbar/active_streak.gif"
                     class="w-full h-full object-fit"
                     alt={locale.t('pages.pixel.components.toolsBar.streak.alt.active')}>
            {:else}
                <img src="/toolsbar/not_active_streak.png"
                     class="w-full h-full object-fit"
                     alt={locale.t('pages.pixel.components.toolsBar.streak.alt.inactive')}>
            {/if}
            <span
                    class="absolute text-black text-md font-bold text-center font-hylia-serif"
                    style="top: 50%; left: 50%; transform: translate(-50%, -20%);text-shadow: 0 0 5px #fff, 0 0 5px #fff, 0 0 5px #fff, 0 0 5px #fff;">
                {streak}
             </span>
        </Tooltip>
    </button>
    <PatchNotesModal patchNotes={patchNotes}>
        {#snippet button(toggleModal)}
            <button
                    onclick={toggleModal}
                    class="cursor-pointer size-[32px] hover:fill-[#fff] duration-300">
                <Tooltip text={locale.t('pages.pixel.components.toolsBar.patchNotes.tooltip')}>
                    <img src="/toolsbar/changelog.png"
                         class="w-full h-full object-fit opacity-70 hover:opacity-100"
                         alt={locale.t('pages.pixel.components.toolsBar.patchNotes.alt')}
                    />
                </Tooltip>
            </button>
        {/snippet}
    </PatchNotesModal>
    <StylizedModal>
        {#snippet trigger(toggleModal)}
            <button
                    onclick={toggleModal}
                    class="flex items-center justify-center w-8 duration-300 relative hover:cursor-pointer">
                <Tooltip
                        maxWidth={150}
                        text={locale.t('pages.pixel.components.toolsBar.howToPlay.tooltip')}>
                    <svg
                            class="size-12 stroke-[#C3C1C1] hover:stroke-[#fff]"
                            viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M12.5 13C12.5 11 14 11.5 14 10C14 9.34375 13.5 8.5 12.5 8.5C11.5 8.5 11 9 10.5 9.5M12.5 16V14.5M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z"
                                  stroke-width="1.2"></path>
                        </g>
                    </svg>
                </Tooltip>
            </button>
        {/snippet}
        {#snippet title()}
            {locale.t('pages.pixel.modals.how_to_play_pixel.title')}
        {/snippet}
        {#snippet content()}
            <div class="flex flex-col gap-5 text-left">
                <div>
                    <h2 class="font-bold text-lg text-white mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.introduction_title')}</h2>
                    <p class="text-gray-300">{locale.t('pages.pixel.modals.how_to_play_pixel.introduction_description')}</p>
                </div>

                <div>
                    <h2 class="font-bold text-lg text-white mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.gameplay_title')}</h2>
                    <p class="text-gray-300">{locale.t('pages.pixel.modals.how_to_play_pixel.gameplay_description')}</p>
                </div>

                <div>
                    <h2 class="font-bold text-lg text-white mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.pixelation_system_title')}</h2>
                    <p class="text-gray-300 mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.pixelation_system_description')}</p>
                    <ul class="list-none pl-0 text-gray-300">
                        <li class="mb-1">{@html locale.t('pages.pixel.modals.how_to_play_pixel.pixelation_phase_1')}</li>
                        <li class="mb-1">{@html locale.t('pages.pixel.modals.how_to_play_pixel.pixelation_phase_2')}</li>
                        <li class="mb-1">{@html locale.t('pages.pixel.modals.how_to_play_pixel.pixelation_phase_3')}</li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-bold text-lg text-white mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_title')}</h2>
                    <ul class="list-none pl-0 text-gray-300">
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_1')}</li>
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_2')}</li>
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_3')}</li>
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_4')}</li>
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_5')}</li>
                        <li class="mb-1">{locale.t('pages.pixel.modals.how_to_play_pixel.strategy_tip_6')}</li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-bold text-lg text-white mb-2">{locale.t('pages.pixel.modals.how_to_play_pixel.daily_challenge_title')}</h2>
                    <p class="text-gray-300">{locale.t('pages.pixel.modals.how_to_play_pixel.daily_challenge_description')}</p>
                </div>
            </div>
        {/snippet}
    </StylizedModal>

</ToolsBar>