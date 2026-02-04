<script lang="ts">
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import Tab from "./Tab.svelte";
    import { ValidatedInput, Field, Button } from "$lib/ui";
    import type { FormResponse } from "../+page.server";

    const form: FormResponse | undefined = $derived(page.form);
    let updateProfileForm: FormResponse["update_profile"] = $state(undefined);
    const profile = $derived(page.data.profile);

    $effect(() => {
        if (page.form?.update_profile !== undefined) {
            updateProfileForm = page.form.update_profile;
        }
    });
</script>

<Tab name="Basic Information" id="tab-basic-information">
    <form method="POST" action="?/update_profile" use:enhance>
        <Field>
            <label for="full_name">Full Name</label>
            <ValidatedInput
                id="full_name"
                name="full_name"
                type="text"
                value={profile.full_name}
                maxlength={64}
                customError={updateProfileForm?.failures.full_name}
                autocomplete="off"
            />
        </Field>
        <Field>
            <label for="username">Username</label>
            <ValidatedInput
                id="username"
                name="username"
                type="text"
                value={profile.username}
                maxlength={32}
                customError={updateProfileForm?.failures.username}
                required
                autocomplete="off"
            />
        </Field>
        <Field>
            <label for="website">Website / Social Media</label>
            <ValidatedInput
                id="website"
                name="website"
                type="text"
                value={profile.website}
                customError={updateProfileForm?.failures.website}
                maxlength={128}
                autocomplete="off"
            />
        </Field>
        <div>
            <Button type="submit">Update Profile</Button>
            <span
                style:color={updateProfileForm?.success
                    ? "var(--fg)"
                    : "var(--warning-subtle)"}
            >
                {updateProfileForm?.success
                    ? "Updated profile successfully"
                    : updateProfileForm?.failures.general}
            </span>
        </div>
    </form>
    <form method="POST" action="?/reset_profile" id="reset-profile" use:enhance>
        <h3>Actions</h3>
        <div>
            <Button variant="link" type="submit"
                >Reset profile information</Button
            >
            <span
                style:color={form?.reset_profile?.success
                    ? "var(--fg)"
                    : "var(--warning-subtle)"}
            >
                {form?.reset_profile?.success
                    ? "Profile reset successfully"
                    : form?.reset_profile?.failures.general}
            </span>
        </div>
    </form>
</Tab>

<style>
    form {
        display: flex;
        flex-direction: column;
        max-width: 30em;
        gap: 1em;

        div {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            align-items: flex-start;
        }
    }

    #reset-profile {
        h3 {
            margin: 0;
        }

        align-items: flex-start;
    }
</style>
