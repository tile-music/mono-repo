<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        variant?: "row" | "column";
        row?: boolean;
    }

    const { children, variant, row }: Props = $props();
    const effectiveVariant = $derived(variant ?? (row ? "row" : "column"));
</script>

<div data-variant={effectiveVariant}>
    {@render children?.()}
</div>

<style>
    div {
        display: flex;
        gap: 0.25rem;

        &[data-variant="row"] {
            flex-direction: row;
            align-items: center;
            gap: 0.5rem;
        }

        &[data-variant="column"] {
            flex-direction: column;
        }
    }
</style>
