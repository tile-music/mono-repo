<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData as LoginActionData } from "./login/$types";
    import type { ActionData as RegisterActionData } from "./register/$types";
    import { PasswordInput, ValidatedInput, Field, Button } from "$lib/ui";

    interface Props {
        type: "login" | "register";
        form: LoginActionData | RegisterActionData;
    }

    let { type, form }: Props = $props();

    let formError = $derived(form?.failures.general ?? "");
</script>

<main>
    <h1>{type === "login" ? "Welcome back!" : "Welcome!"}</h1>
    <form
        method="POST"
        action="?/{type}"
        use:enhance
        oninput={() => (formError = "")}
    >
        <fieldset>
            <Field>
                <label for="id">Email</label>
                <ValidatedInput
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="hello@tile.music"
                    customError={form?.failures.email}
                />
            </Field>

            <Field>
                <label for="password">Password</label>
                <PasswordInput
                    id="password"
                    name="password"
                    required
                    minlength={8}
                    maxlength={32}
                    placeholder="8-32 ch., 1 or more #s"
                    customError={form?.failures.password}
                />
            </Field>
            {#if type === "register"}
                <Field>
                    <label for="confirm">Confirm Password</label>
                    <PasswordInput
                        id="confirm"
                        name="confirm"
                        required
                        minlength={8}
                        maxlength={32}
                        placeholder="8-32 ch., 1 or more #s"
                        customError={form?.failures.confirm}
                    />
                </Field>
            {/if}
        </fieldset>
        <fieldset id="submit">
            <p>{formError}</p>
            {#if type === "register"}
                <Button type="submit">Register</Button>
                <a href="/login">Already have an account?</a>
            {:else}
                <Button type="submit">Login</Button>
                <a href="/register">Don't have an account?</a>
            {/if}
        </fieldset>
    </form>
</main>

<style>
    main,
    form,
    fieldset {
        display: flex;
        flex-direction: column;
    }

    main {
        align-items: center;
    }

    form {
        gap: 1rem;
        align-items: center;

        fieldset {
            gap: 1rem;
            width: 18em;
        }

        #submit {
            width: auto;

            p {
                color: var(--warning-subtle);
            }
        }
    }
</style>
