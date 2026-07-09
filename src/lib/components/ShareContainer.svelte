    <!-- ShareContainer.svelte -->
    <script lang="ts">
        import ShareButton from "$lib/components/buttons/ShareButton.svelte";
        import TweetButton from "$lib/components/buttons/TweetButton.svelte";
        import locale from "$lib/stores/locale.svelte";
        import ContentCard from "$lib/components/ContentCard.svelte";
        import MarvelRivalsButton from "$lib/components/buttons/MarvelRivalsButton.svelte";

        interface Props {
            text: string;
            copyText: string;
            websiteUrl: string;
            class?: string;
            tries?: {
                gender: string;
                region: string;
                season: string;
                birthday: string;
                marriageable: string;
                age: string;
            }[]
        }

        let {text, copyText, websiteUrl, class: clazz, tries}: Props = $props();

        function getUrlFormattedText(): string {
            return copyText.replace(/#/g, '%23').replace(/\n/g, '%0A') + '%0A' + websiteUrl;
        }
    </script>
    <div class="flex flex-col w-full justify-center items-center gap-1 text-center justify-items-center py-4 px-6 border-[3px] border-[#74451f] bg-[#74451f99] font-lilita"
    >
        <span class="text-xl text-white stardew-text max-w-[250px]">{@html text}</span>
        {#if tries}
            <div class="mt-4">
                {#each tries.reverse().slice(0, 5) as attempt}
                    <p class="my-1 flex justify-center space-x-1">
                        <span>{attempt.gender === 'CORRECT' ? '🟩' : '🟥'}</span>
                        <span>{attempt.region === 'CORRECT' ? '🟩' : '🟥'}</span>
                        <span>{attempt.season === 'CORRECT' ? '🟩' : '🟥'}</span>
                        <span>{attempt.birthday === 'CORRECT' ? '🟩' : attempt.birthday === 'HIGHER' ? '⬆️' : attempt.birthday === 'LOWER' ? '⬇️' : '🟥'}</span>
                        <span>{attempt.marriageable === 'CORRECT' ? '🟩' : '🟥'}</span>
                        <span>{attempt.age === 'CORRECT' ? '🟩' : attempt.age === 'HIGHER' ? '⬆️' : attempt.age === 'LOWER' ? '⬇️' : '🟥'}</span>
                    </p>
                {/each}
                {#if tries.length > 5}
                    <span class="text-xl text-white font-lilita">
                        {locale.t('components.shareContainer.and_more', { count: tries.length - 5 })}
                    </span>
                {/if}
            </div>
        {/if}
        <span class="text-2xl text-white stardew-text">https://{websiteUrl}</span>
        <div class="flex flex-row  w-full justify-center mt-4 mb-4">
            <MarvelRivalsButton
                    slant="left"
                    width={'100%'}
                    class="max-w-[194px]"
                    title={locale.t('components.shareContainer.buttons.tweet.title')}
                    ariaLabel={locale.t('components.shareContainer.buttons.tweet.aria_label')}
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${getUrlFormattedText()}`, '_blank')}
            >
            </MarvelRivalsButton>
            <MarvelRivalsButton
                    slant="right"
                    width={'100%'}
                    class="max-w-[194px]"
                    height={'50'}
                    title={locale.t('components.shareContainer.buttons.copy.title')}
                    ariaLabel={locale.t('components.shareContainer.buttons.copy.aria_label')}
                    onClick={() => navigator.clipboard.writeText(copyText)}
            >
            </MarvelRivalsButton>
        </div>
    </div>
