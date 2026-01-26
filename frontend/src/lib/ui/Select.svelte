<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLSelectAttributes } from "svelte/elements";

    type Props = HTMLSelectAttributes & {
        children?: Snippet;
        variant?: "outline" | "inline";
    };

    const { children, variant = "outline", ...props }: Props = $props();
</script>

<select data-variant={variant} {...props}>
    {@render children?.()}
</select>

<style>
    select {
        background: none;
        color: var(--fg);

        &[data-variant="outline"] {
            border: 1px solid var(--border);
            border-radius: 5px;
            padding: 0.2em 0.5em;
        }

        &[data-variant="inline"] {
            border-bottom: 2px solid var(--border);
        }
    }
</style>
