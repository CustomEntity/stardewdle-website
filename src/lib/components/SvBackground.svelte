<!-- Stardew title-screen background: starfield sky + parallax mountains (real game sprites). -->
<div class="sv-bg" aria-hidden="true">
    <div class="stars"></div>
    <div class="mtn mtn-blue"></div>
    <div class="mtn mtn-green"></div>
</div>

<style>
    .sv-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        pointer-events: none;
    }

    .stars {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 55%;
        opacity: 0.9;
        background-image:
            radial-gradient(1.5px 1.5px at 12% 18%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 28% 8%, #fff, transparent),
            radial-gradient(1px 1px at 42% 24%, #cfe6ff, transparent),
            radial-gradient(2px 2px at 58% 12%, #fff, transparent),
            radial-gradient(1px 1px at 71% 30%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 85% 16%, #fff, transparent),
            radial-gradient(1px 1px at 93% 6%, #cfe6ff, transparent),
            radial-gradient(1px 1px at 6% 40%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 34% 44%, #fff, transparent),
            radial-gradient(1px 1px at 64% 40%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 78% 46%, #cfe6ff, transparent),
            radial-gradient(1px 1px at 50% 34%, #fff, transparent);
    }

    .mtn {
        position: absolute;
        left: 0;
        right: 0;
        background-repeat: repeat-x;
        background-position: bottom center;
        image-rendering: pixelated;
    }

    /* far (bluish) range, sitting a bit higher */
    .mtn-blue {
        bottom: 130px;
        height: 300px;
        background-image: url('/ui/mtn-blue.png');
        background-size: auto 300px;
        opacity: 0.9;
    }

    /* near (bright green) range at the very bottom */
    .mtn-green {
        bottom: 0;
        height: 340px;
        background-image: url('/ui/mtn-green.png');
        background-size: auto 340px;
    }

    @media (max-width: 828px) {
        .mtn-blue { height: 200px; background-size: auto 200px; bottom: 90px; }
        .mtn-green { height: 220px; background-size: auto 220px; }
    }
</style>
