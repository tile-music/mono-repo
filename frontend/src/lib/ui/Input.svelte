<script module lang="ts">
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
        checked = $bindable(),
        group = $bindable(),
        variant = "outline",
        id,
        type,
        ...props
    }: InputProps = $props();
</script>

{#if type === "radio"}
    <input
        {id}
        type="checkbox"
        bind:group
        bind:this={input}
        class="text-input"
        data-variant={variant}
        {...props}
    />
{:else if type === "checkbox"}
    <input
        {id}
        type="checkbox"
        bind:group
        bind:checked
        bind:this={input}
        class="text-input"
        data-variant={variant}
        {...props}
    />
{:else}
    <input
        {id}
        {type}
        bind:this={input}
        bind:value
        class="text-input"
        data-variant={variant}
        {...props}
    />
{/if}

<style>
    input {
        background-color: transparent;
        color: var(--fg);
        border: none;
        min-width: 0;

        &[data-variant="outline"] {
            border: 1px solid var(--border);
            border-radius: 5px;
            padding: 0.2em 0.5em;
        }

        &[data-variant="inline"] {
            border-bottom: 2px solid var(--border);
        }

        &:user-invalid {
            border-color: var(--warning);
        }
    }

    ::placeholder {
        color: var(--fg-subtle);
    }
</style>
