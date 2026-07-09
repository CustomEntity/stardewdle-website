<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        href: string;
        title: string;
        subtitle: string;
        gameMode: "classic" | "pixel" | "emoji";
        class?: string;
    }

    let {
        href = "",
        title = "CLASSIC",
        subtitle = "GUESS THE SKIN FROM A VIDEO",
        gameMode = "classic",
        class: className = "w-[433px] h-[128px]",
    }: Props = $props();

    let isHovered = $state(false);
    let buttonElement: HTMLAnchorElement;
    let textContainer: HTMLDivElement | undefined = $state();
    let subtitleMeasure: HTMLSpanElement | undefined = $state();
    let subtitleWraps = $state(false);

    $effect(() => {
        if (!textContainer || !subtitleMeasure) return;

        const check = () => {
            if (!textContainer || !subtitleMeasure) return;
            subtitleWraps =
                subtitleMeasure.scrollWidth > textContainer.clientWidth;
        };

        const ro = new ResizeObserver(check);
        ro.observe(textContainer);
        check();

        return () => ro.disconnect();
    });

    function handleMouseEnter() {
        isHovered = true;
    }

    function handleMouseLeave() {
        isHovered = false;
    }

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        goto(href, { replaceState: false });
    }

    function getResetTime() {
        const now = new Date();
        const nextReset = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 1,
                0,
                0,
                0,
            ),
        );
        const diff = nextReset.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
</script>

<a
    {href}
    class="relative justify-center block cursor-pointer transition-transform duration-200 text-center overflow-visible no-underline button-container hover:scale-95 {className}"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onclick={handleClick}
    bind:this={buttonElement}
    data-sveltekit-preload="hover"
    style="background-image: url('/home_buttons/{gameMode}.svg'); background-size: 100% 100%; background-repeat: no-repeat;"
>
    <div
        class="absolute font-lilita text-md top-1.5 right-20 sm:top-5.5 sm:right-8 text-[#e8d3a0] sm:text-xs"
    >
        {locale.t('pages.home.reset_in', { time: getResetTime() })}
    </div>
    <div
        bind:this={textContainer}
        class="text-left stardew-text absolute left-33 right-4 top-8.5 sm:left-17.5 sm:right-3 sm:top-10.5"
    >
        <h3 class="text-white text-2xl sm:text-lg font-bold leading-tight">
            {title.toUpperCase()}
        </h3>
        <p
            class="text-white text-md leading-tight {subtitleWraps
                ? 'sm:text-xs'
                : 'sm:text-sm'}"
        >
            {subtitle}
        </p>
        <span
            bind:this={subtitleMeasure}
            aria-hidden="true"
            class="absolute invisible whitespace-nowrap pointer-events-none text-md sm:text-sm"
            >{subtitle}</span
        >
    </div>
</a>
