<script>
    import locale from "$lib/stores/locale.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
</script>


<h2 class="text-white text-2xl text-center uppercase stardew-text">
    { locale.t('pages.home.title')}
</h2>

<div class="mt-6 w-full flex flex-col gap-4 max-w-[440px]">
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.classic.title') }
            subtitle={ locale.t('pages.home.button.classic.description') }
            gameMode="classic"
            href="/classic"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.crop.title') }
            subtitle={ locale.t('pages.home.button.crop.description') }
            gameMode="crop"
            href="/crop"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.fish.title') }
            subtitle={ locale.t('pages.home.button.fish.description') }
            gameMode="fish"
            href="/fish"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.pixel.title') }
            subtitle={ locale.t('pages.home.button.pixel.description') }
            gameMode="pixel"
            href="/pixel"/>
    <HomeButton
            class={'w-full h-[120px]'}
            title={ locale.t('pages.home.button.emoji.title') }
            subtitle={ locale.t('pages.home.button.emoji.description') }
            gameMode="emoji"
            href="/emoji"/>
</div>
