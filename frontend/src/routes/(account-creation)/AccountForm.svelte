<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    import type { Failures } from './validateAccountForm';
    interface Props {
        type: "login" | "register";
    }

    let { type }: Props = $props();

    let status: {
        submitting: boolean,
        invalidCredentials: boolean,
        failures: Failures
    } = $state({
        submitting: false,
        invalidCredentials: false,
        failures: {
            missingEmail: false,
            missingPassword: false,
            passwordMismatch: false,
            invalidEmail: false,
            invalidPassword: {
                tooShort: false,
                tooLong: false,
                noNumbers: false
            },
            alreadyTaken: false
        }
    })

    let buttonText = $derived(status.submitting === true ? "working..." : (type === "login" ? "log in" : "get started"));
    let invalidPasswordText = $state(determineInvalidPasswordText());
    let invalidEmailText = $state(determineInvalidEmailText());

    const submit: SubmitFunction = () => {
        status.submitting = false;
        return async ({ result, update }) => {
            // if login was unsuccessful, change the status to reflect what went wrong
            if (result.type === "failure") {
                Object.assign(status, result.data);
                invalidPasswordText = determineInvalidPasswordText();
                invalidEmailText = determineInvalidEmailText();
            }
            await update();
            status.submitting = false;
        }; 
    }

    function determineInvalidPasswordText(): string {
        if (status.failures.missingPassword) return "please enter a password"
        if (status.failures.invalidPassword.tooShort) return "password must be at least 8 characters"
        if (status.failures.invalidPassword.tooLong) return "password must be 64 characters or less"
        if (status.failures.invalidPassword.noNumbers) return "password must contain a number"
        return ""
    }

    function determineInvalidEmailText(): string {
        if (status.failures.missingEmail) return "please enter an email"
        if (status.failures.invalidEmail) return "please enter a valid email"
        if (status.failures.alreadyTaken) return "this email is already taken"
        return ""
    }

    let passwordVisible = $state(false);
    function togglePasswordVisibility() {
        passwordVisible = !passwordVisible;
    }

    let passwordConfirmVisible = $state(false);
    function togglePasswordConfirmVisibility() {
        passwordConfirmVisible = !passwordConfirmVisible;
    }
</script>

<div id="content">
    <h1>welcome!</h1>
    <form method="POST" action={"?/" + type} use:enhance={submit}>
        <fieldset>
            <div>
                <p>{invalidEmailText}</p>
                <input type="text" name="email" id="email" placeholder="email" disabled={status.submitting}>
            </div>
            <div>
                <p>{invalidPasswordText}</p>
                <input type={passwordVisible ? "text" : "password"} name="password" id="password" placeholder="password" disabled={status.submitting}>
                <button type="button" onclick={togglePasswordVisibility}>{ passwordVisible?"hide" : "show" } password</button>
            </div>
            {#if type === "register"}
                <div>
                    <p>{status.failures.passwordMismatch ? "passwords must match" : ""}</p>
                    <input type={passwordConfirmVisible ? "text" : "password"} name="confirm_password" id="confirm_password" placeholder="confirm password" disabled={status.submitting}>
                    <button type="button" onclick={togglePasswordConfirmVisibility}>{ passwordConfirmVisible?"hide" : "show" } password</button>
                </div>
            {:else}
                <p>{status.invalidCredentials ? "invalid credentials. please try again" : ""}</p>
            {/if}
        </fieldset>
        <fieldset>
            <input type="submit" id="submit" value={buttonText}>
            {#if type === "login"}
                <a href="register">don't have an account?</a>
            {:else}
                <a href="login">already have an account?</a>
            {/if}
        </fieldset>
    </form>
</div>

<style>
    #content {
        display: flex;
        flex-direction: column;
        gap: 50px;
    }

    form, fieldset, div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    form {
        gap: 30px;
    }

    fieldset {
        gap: 10px;
    }

    p {
        height: 0.85em;
        font-size: 0.85em;
        margin-bottom: 10px;
    }

    input[type=submit] {
        width: 10rem;
    }

    button {
        background-color: var(--accent);
        color: var(--background);
        border: none;
        padding: 0px 10px;
        margin-top: 5px;
        font-size: 0.75em;
        cursor: pointer;
        border-radius: 25px;
        font-family: "Mattone", sans-serif;
    }
</style>