<script>
    import locale from "$lib/stores/locale.svelte";
    import HomeButton from "$lib/components/buttons/HomeButton.svelte";
</script>


<h2 class="text-white text-2xl text-center uppercase stardew-text">
    { locale.t('pages.home.title')}
</h2>

<div class="mt-6 w-full flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-0 sm:max-w-[500px]">
    <HomeButton
            class={'w-full h-[180px]'}
            title={ locale.t('pages.home.button.classic.title') }
            subtitle={ locale.t('pages.home.button.classic.description') }
            gameMode="classic"
            href="/classic"/>
    <HomeButton
            class={'w-full h-[180px]'}
            title={ locale.t('pages.home.button.pixel.title') }
            subtitle={ locale.t('pages.home.button.pixel.description') }
            gameMode="pixel"
            href="/pixel"/>
    <HomeButton
            class={'w-full h-[180px]'}
            title={ locale.t('pages.home.button.emoji.title') }
            subtitle={ locale.t('pages.home.button.emoji.description') }
            gameMode="emoji"
            href="/emoji"/>
</div>
