<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    export let type: "login" | "register";

    let status = {
        submitting: false,
        missingEmail: false,
        missingPassword: false,
        passwordMismatch: false
    }
    const submit: SubmitFunction = () => {
        status.submitting = true;

        return async ({ result, update }) => {
            if (result.type === "failure") {
                console.log(result)
                Object.assign(status, result.data)
            } else {
            }
            await update();
            status.submitting = false;
        }; 
    }
</script>

<div>
    <h1>welcome!</h1>
    <form method="POST" action={"?/" + type} use:enhance={submit}>
        <fieldset>
            <input type="text" name="email" id="email" placeholder="email" disabled={status.submitting}>
            <p>{status.missingEmail ? "please enter an email" : ""}</p>
            <input type="password" name="password" id="password" placeholder="password" disabled={status.submitting}>
            <p>{status.missingPassword ? "please enter a password" : ""}</p>
            {#if type === "register"}
                <input type="password" name="confirm_password" id="confirm_password" placeholder="confirm password" disabled={status.submitting}>
                <p>{status.passwordMismatch ? "passwords must match" : ""}</p>
            {/if}
        </fieldset>
        <fieldset>
            <input type="submit" value={type === "login" ? "log in" : "get started"}>
            {#if type === "login"}
                <a href="register">don't have an account?</a>
            {:else}
                <a href="login">already have an account?</a>
            {/if}
        </fieldset>
    </form>
</div>

<style>
    /* alignment */
    div, form, fieldset {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    div, form {
        gap: 100px;
    }

    fieldset {
        gap: 10px;
    }

    p {
        height: 0.85em;
        font-size: 0.85em;
        margin-bottom: 10px;
    }
</style>