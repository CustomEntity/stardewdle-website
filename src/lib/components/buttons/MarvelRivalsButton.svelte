<!-- Button3D.svelte -->
<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        onClick: () => void;
        title: string;
        ariaLabel?: string;
        width?: string;
        height?: string;
        icon?: Snippet;
        class?: string;
        disabled?: boolean;
    }

    let {
        onClick,
        title = 'BUTTON',
        ariaLabel,
        width = '137px',
        height = '44px',
        icon,
        class: clazz,
        disabled = false
    }: Props = $props()

    let isHovered = $state(false);
    let isActive = $state(false);
    let buttonElement: HTMLButtonElement;

    function handleMouseEnter() {
        if (!disabled) {
            isHovered = true;
        }
    }

    function handleMouseLeave() {
        isHovered = false;
        isActive = false;
    }

    function handleMouseDown() {
        if (!disabled) {
            isActive = true;
        }
    }

    function handleMouseUp() {
        isActive = false;
    }

    function handleClick(event) {
        if (disabled) {
            event.preventDefault();
            return;
        }
        onClick();
    }
</script>

<button
        aria-label={ariaLabel}
        onclick={handleClick}
        bind:this={buttonElement}
        style="width: {width}; height: {height}"
        class="button-container {clazz} {disabled ? 'disabled' : ''}"
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        onmousedown={handleMouseDown}
        onmouseup={handleMouseUp}
        {disabled}
>
    <div class="button-content" class:hovered={isHovered} class:active={isActive}>
        <!-- SVG Background -->
        <svg
                class="button-svg"
                width="137"
                height="44"
                viewBox="0 0 137 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="filter0_d_{buttonElement?.id || 'default'}" x="0" y="0" width="136.956" height="43.8301" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="3"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <mask id="mask0_{buttonElement?.id || 'default'}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="1" y="1" width="135" height="39">
                    <path d="M4.54967 3.8937C4.70694 2.36367 5.99586 1.20044 7.53395 1.20044H132.755C134.534 1.20044 135.922 2.73833 135.74 4.50718L132.406 36.9374C132.249 38.4674 130.96 39.6307 129.422 39.6307H4.20063C2.42246 39.6307 1.03454 38.0928 1.21635 36.3239L4.54967 3.8937Z" fill="#6cae3f"/>
                </mask>
            </defs>

            <g filter="url(#filter0_d_{buttonElement?.id || 'default'})">
                <path
                        class="button-main-path"
                        d="M4.54967 3.89321C4.70694 2.36319 5.99586 1.19995 7.53395 1.19995H132.755C134.534 1.19995 135.922 2.73784 135.74 4.50669L132.406 36.9369C132.249 38.467 130.96 39.6302 129.422 39.6302H4.20063C2.42246 39.6302 1.03454 38.0923 1.21635 36.3235L4.54967 3.89321Z"
                        fill={disabled ? "#999999" : "#6cae3f"}
                />
                <path
                        d="M132.755 0.600342C134.889 0.600342 136.555 2.44549 136.336 4.56812L133.003 36.9978C132.815 38.8338 131.268 40.2301 129.422 40.2302H4.20068C2.067 40.2302 0.401662 38.3849 0.619629 36.2625L3.95264 3.83179C4.14137 1.99587 5.68812 0.600473 7.53369 0.600342H132.755Z"
                        stroke="black"
                        stroke-width="1.2"
                />
            </g>

            <g mask="url(#mask0_{buttonElement?.id || 'default'})">
                <rect x="0.876465" y="0.237549" width="134.345" height="4.05357" fill={disabled ? "#BBBBBB" : "#7bc74d"}/>
                <rect x="-1.05713" y="36.6096" width="134.345" height="4.05357" fill={disabled ? "#777777" : "#3f8128"}/>
                <path d="M136.08 8.53405L128.997 0.775146H136.08V8.53405Z" fill={disabled ? "#AAAAAA" : "#8fd05a"}/>
            </g>
        </svg>

        <!-- Hover Effect -->
        <div class="button-hover" class:visible={isHovered}></div>

        <!-- Text Content -->
        <span class="button-text">
            <span class="button-title uppercase whitespace-nowrap">
                {title}
            </span>
            {#if icon}
                {@render icon()}
            {/if}
        </span>
    </div>
</button>

<style>
    .button-container {
        position: relative;
        cursor: pointer;
        transition: transform 0.2s;
        display: inline-block;
        border: none;
        background: transparent;
        padding: 0;
    }

    .button-container:hover:not(.disabled) .button-content {
        transform: scale(0.95);
    }

    .button-container.disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .button-content {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease-out;
    }

    .button-content.active:not(.disabled) {
        transform: translateY(2px) scale(1.02);
    }

    .button-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .button-content.hovered:not(.disabled) .button-main-path {
        fill: #6cae3f;
        transition: fill 0.2s;
    }

    .button-hover {
        position: absolute;
        inset: 0;
        background-color: white;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 2;
        pointer-events: none;
    }


    .disabled .button-hover.visible {
        opacity: 0;
    }

    .button-text {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 0.5rem;
        pointer-events: none;
    }

    .button-title {
        color: white;
        text-align: center;
        font-size: 14px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .disabled .button-title {
        color: #EEEEEE;
    }
</style>