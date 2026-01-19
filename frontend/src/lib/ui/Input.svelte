<script module>
    export type InputProps = HTMLInputAttributes & {
        type: HTMLInputElement["type"];
        input?: HTMLInputElement;
        id: string;
        variant?: "outline" | "inline";
    };
</script>

<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    let {
        input = $bindable(),
        value = $bindable(),
        variant = "outline",
        id,
        ...props
    }: InputProps = $props();
</script>

<input
    {id}
    bind:this={input}
    bind:value
    class="text-input"
    data-variant={variant}
    {...props}
/>

<style>
    input {
        background-color: transparent;
        color: var(--fg);

        &[data-variant="outline"] {
            border: 1px solid var(--border);
            border-radius: 5px;
            padding: 0.2em 0.5em;
        }

        &[data-variant="inline"] {
            border-bottom: 2px solid var(--border);
        }

        &:user-invalid {
            border-color: red;
        }
    }

    ::placeholder {
        color: var(--fg-subtle);
    }
</style>
