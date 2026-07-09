<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        children: Snippet;
    }

    const {children}: Props = $props();

</script>

<div class="flex justify-center items-center gap-4 border-[3px] border-[#74451f] bg-[#74451f99] font-lilita px-6 py-1">
    {@render children()}
</div>