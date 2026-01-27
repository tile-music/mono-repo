<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props extends HTMLButtonAttributes {
        variant?: "strong" | "subtle" | "link";
        children: Snippet;
    }

    const { variant = "strong", children, ...props }: Props = $props();
</script>

<button data-variant={variant} {...props}>
    {@render children()}
</button>

<style>
    button {
        border: none;

        &[data-variant="strong"],
        &[data-variant="subtle"] {
            background-color: var(--accent);
            color: var(--bg);
            border-radius: 9999px;
            font-family: "Mattone";

            &:hover {
                background-color: var(--accent-subtle);
            }

            &[data-variant="strong"] {
                padding: 0.75em 1em;
            }

            &[data-variant="subtle"] {
                padding: 0.5em 0.2em;
                font-size: 1rem;
            }
        }

        &[data-variant="link"] {
            background: none;
            color: var(--accent);
            padding: 0;
            font-size: 1rem;
            text-decoration: underline;
        }
    }
</style>
