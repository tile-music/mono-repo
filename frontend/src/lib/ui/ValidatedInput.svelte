<script module lang="ts">
    export type ValidatedInputProps = InputProps & {
        error?: string;
        customError?: string;
        floating?: boolean;
    };
</script>

<script lang="ts">
    import type { InputProps } from "./Input.svelte";
    import Input from "./Input.svelte";
    import type { FormEventHandler, FocusEventHandler } from "svelte/elements";

    let {
        input = $bindable(),
        error = $bindable(),
        customError,
        floating = false,
        ...props
    }: ValidatedInputProps = $props();

    let displayedError = $derived(customError ?? "");

    $effect(() => {
        if (input && customError != undefined)
            input.setCustomValidity(customError);
    });

    function getErrorText(e: HTMLInputElement): string {
        const { validity } = e;

        // valid inputs return an empty string
        if (validity.valid) return "";

        // if a custom validity is set, surface that first
        if (validity.customError) return e.validationMessage;

        // order matters; we return the first relevant message
        if (validity.valueMissing) {
            // Required but empty
            return "This field is required.";
        }

        if (validity.typeMismatch) {
            // Email, URL, etc. doesn't match the input type
            const type = e.type;
            switch (type) {
                case "email":
                    return "Please enter a valid email address.";
                case "url":
                    return "Please enter a valid URL.";
                case "tel":
                    return "Please enter a valid phone number.";
                case "number":
                    return "Please enter a valid number.";
                default:
                    return "The value does not match the expected format.";
            }
        }

        if (validity.patternMismatch) {
            // Pattern attribute failed
            // Prefer author-specified validationMessage if provided
            return e.validationMessage || "Please match the requested format.";
        }

        if (validity.tooShort) {
            const min = e.minLength;
            return min > 0
                ? `Must be at least ${min} characters.`
                : "The value is too short.";
        }

        if (validity.tooLong) {
            const max = e.maxLength;
            return max > 0
                ? `Cannot exceed ${max} characters.`
                : "The value is too long.";
        }

        if (validity.rangeUnderflow) {
            // number/date below min
            return e.min
                ? `Value must be at least ${e.min}.`
                : "The value is below the allowed minimum.";
        }

        if (validity.rangeOverflow) {
            // number/date above max
            return e.max
                ? `Value cannot exceed ${e.max}.`
                : "The value is above the allowed maximum.";
        }

        if (validity.stepMismatch) {
            // number step mismatch
            return e.step
                ? `Please enter a valid multiple of ${e.step}.`
                : "Please enter a valid step increment.";
        }

        if (validity.badInput) {
            // browser couldn't convert input to the right type
            const type = e.type;
            switch (type) {
                case "number":
                    return "Please enter a number.";
                case "date":
                    return "Please enter a valid date.";
                case "time":
                    return "Please enter a valid time.";
                default:
                    return "The input provided is invalid.";
            }
        }

        // no known validity errors; use browser message if present or empty string
        return e.validationMessage || "";
    }

    const oninput: FormEventHandler<HTMLInputElement> = (...args) => {
        // chain existing oninput
        if (props.oninput) props.oninput(...args);

        // set displayed error
        displayedError = "";
    };

    const onblur: FocusEventHandler<HTMLInputElement> = (...args) => {
        // chain existing oninput
        if (props.onblur) props.onblur(...args);

        // set new input text
        error = getErrorText(args[0].currentTarget);
        displayedError = error;
    };

    const onfocus: FocusEventHandler<HTMLInputElement> = (...args) => {
        // chain existing oninput
        if (props.onfocus) props.onfocus(...args);

        // set new input text
        displayedError = "";

        input?.setCustomValidity("");
    };
</script>

<div data-error-variant={floating ? "floating" : "inline"}>
    <Input
        bind:input
        {...props}
        {oninput}
        {onblur}
        {onfocus}
        oninvalid={(e) => e.preventDefault()}
        aria-describedby="error-{props.id}"
    />
    {#if displayedError !== ""}
        <div class="error" id="error-{props.id}">{displayedError}</div>
    {/if}
</div>

<style>
    div {
        &[data-error-variant="floating"] {
            position: relative;

            .error {
                position: absolute;
                bottom: 0;
                width: 100%;
                transform: translateY(calc(100% + 2px));
                background: var(--bg-subtle);
                border: 1px solid var(--border);
                border-radius: 5px;
                padding: 0.2em 0.5em;
                z-index: 2;
                text-align: center;
            }
        }

        &[data-error-variant="inline"] {
            display: flex;
            flex-direction: column;
            gap: 0.25em;

            .error {
                width: 100%;
                color: var(--warning-subtle);
            }
        }
    }
</style>
