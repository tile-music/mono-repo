<script lang="ts">
    import Tab from "./Tab.svelte";
    import { Button } from "$lib/ui";
    import { page } from "$app/state";
    import type { FormResponse } from "../+page.server";
    import { enhance } from "$app/forms";

    const form: FormResponse = $derived(page.form);
</script>

<Tab name="My Data" id="tab-my-data">
    <form method="POST" action="?/reset_listening_data" use:enhance>
        <h3>Actions</h3>
        <Button type="submit" variant="link">Reset listening data</Button>
        <span
            style:color={form?.reset_listening_data?.success
                ? "var(--fg)"
                : "var(--warning-subtle)"}
        >
            {form?.reset_listening_data?.success
                ? "Listening data reset successfully"
                : form?.reset_listening_data?.failures.general}
        </span>
    </form>
</Tab>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;

        h3 {
            margin: 0;
        }
    }
</style>
