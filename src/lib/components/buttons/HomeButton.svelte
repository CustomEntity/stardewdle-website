<script lang="ts">
    import { goto } from "$app/navigation";
    import locale from "$lib/stores/locale.svelte";

    interface Props {
        href: string;
        title: string;
        subtitle: string;
        gameMode: "classic" | "crop" | "fish" | "pixel" | "emoji";
        class?: string;
    }

    let {
        href = "",
        title = "CLASSIC",
        subtitle = "",
        gameMode = "classic",
        class: className = "w-full h-[150px]",
    }: Props = $props();

    const ICONS: Record<string, { emoji: string; bg: string }> = {
        classic: { emoji: "⭐", bg: "#5aa02f" },
        crop: { emoji: "🌱", bg: "#7cb342" },
        fish: { emoji: "🐟", bg: "#4a90d0" },
        pixel: { emoji: "🖼️", bg: "#8a5a34" },
        emoji: { emoji: "😀", bg: "#d9a520" },
    };

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        goto(href, { replaceState: false });
    }

    function getResetTime() {
        const now = new Date();
        const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        const diff = nextReset.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }
</script>

<a
    {href}
    onclick={handleClick}
    data-sveltekit-preload="hover"
    class="sv-panel mode-card {className}"
>
    <span class="reset">{locale.t('pages.home.reset_in', { time: getResetTime() })}</span>
    <span class="icon" style="background:{ICONS[gameMode]?.bg ?? '#5aa02f'};">{ICONS[gameMode]?.emoji ?? '⭐'}</span>
    <span class="txt">
        <span class="title">{title.toUpperCase()}</span>
        <span class="sub">{subtitle}</span>
    </span>
</a>

<style>
    .mode-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 6px 18px;
        text-decoration: none;
        color: #5a3a1c;
        transition: transform 0.15s ease, filter 0.15s ease;
        cursor: pointer;
    }
    .mode-card:hover { transform: translateY(-2px); filter: brightness(1.03); }
    .mode-card:active { transform: translateY(0); }

    .reset {
        position: absolute;
        top: 4px;
        right: 14px;
        font-size: 11px;
        color: #9a7b4c;
    }

    .icon {
        flex: 0 0 auto;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        border-radius: 12px;
        border: 3px solid #4a3016;
        box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.35), inset 0 -4px 0 rgba(0, 0, 0, 0.2);
    }

    .txt { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .title {
        font-size: 26px;
        line-height: 1;
        color: #6a3b18;
        text-shadow: 1px 1px 0 rgba(255, 247, 214, 0.7);
    }
    .sub { font-size: 15px; line-height: 1.15; color: #7a5a34; }

    @media (max-width: 828px) {
        .title { font-size: 22px; }
        .icon { width: 50px; height: 50px; font-size: 26px; }
    }
</style>
