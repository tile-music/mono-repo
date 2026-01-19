<script lang="ts">
    import type { ValidatedInputProps } from "./ValidatedInput.svelte";
    import ValidatedInput from "./ValidatedInput.svelte";

    type Props = Omit<ValidatedInputProps, "type">;

    let props: Props = $props();
    let visible = $state(false);
</script>

<div>
    <ValidatedInput {...props} type={visible ? "text" : "password"} />
    <button
        class="toggle"
        onclick={() => (visible = !visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        type="button"
    >
        <svg
            fill="var(--fg-subtle)"
            stroke="var(--fg-subtle)"
            stroke-linecap="round"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 121.025 121.025"
            xml:space="preserve"
        >
            <g>
                <path
                    d="M1.35,64.212c7.9,9.9,31.4,36.3,59.2,36.3c27.8,0,51.3-26.399,59.2-36.3c1.699-2.2,1.699-5.3,0-7.399 c-7.9-9.9-31.4-36.3-59.2-36.3c-27.8-0.1-51.3,26.3-59.2,36.2C-0.45,58.913-0.45,62.012,1.35,64.212z M60.55,36.413 c13.3,0,24,10.7,24,24s-10.7,24-24,24c-13.3,0-24-10.7-24-24S47.25,36.413,60.55,36.413z"
                />
                <circle cx="60.55" cy="60.413" r="12" />
                {#if visible}
                    <line x1="20" y1="100" x2="100" y2="20" stroke-width="20"
                    ></line>
                {/if}
            </g>
        </svg>
    </button>
</div>

<style>
    div {
        position: relative;
    }

    .toggle {
        display: flex;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background: none;
        width: 20px;
        height: 20px;
        justify-content: center;
        align-items: center;
        padding: 0;
        margin: 0;
    }

    svg {
        width: 16px;
        height: 16px;
    }
</style>
