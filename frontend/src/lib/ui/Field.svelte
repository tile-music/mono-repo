<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
    }

    const { children }: Props = $props();
</script>

<div>
    {@render children?.()}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
</style>
