<script lang="ts">
    import Tab from "./Tab.svelte";
    import { page } from "$app/state";
    import type { Profile } from "$shared/Profile";
    import { Button } from "$lib/ui";
    import type { FormResponse } from "../+page.server";
    import { enhance } from "$app/forms";

    const themes = [
        {
            name: "dark",
            label: "Dark",
        },
        {
            name: "light",
            label: "Light",
        },
    ];

    const profile: Profile = $derived(page.data.profile);
    const form: FormResponse = $derived(page.form);
</script>

<Tab name="Appearance" id="tab-appearance">
    <form method="POST" action="?/update_theme" use:enhance>
        <h3>Theme</h3>
        <p>Your current theme is: {profile.theme}</p>
        <fieldset role="radiogroup">
            {#each themes as theme}
                <label>
                    <input
                        type="radio"
                        name="theme"
                        value={theme.name}
                        onclick={() => {
                            document.documentElement.className = `theme-${theme.name}`;
                        }}
                        autocomplete="off"
                        checked={profile.theme === theme.name}
                        required
                    />
                    <div class="theme-preview theme-{theme.name}">
                        <span>{theme.label}</span>
                        <div>
                            <div class="fg"></div>
                            <div class="bg"></div>
                            <div class="accent"></div>
                            <div class="warning"></div>
                        </div>
                    </div>
                </label>
            {/each}
        </fieldset>
        <Button type="submit">Save Theme</Button>
        <span
            style:color={form?.update_theme?.success
                ? "var(--fg)"
                : "var(--warning-subtle)"}
        >
            {form?.update_theme?.success
                ? "Theme updated successfully"
                : form?.update_theme?.failures.general}
        </span>
    </form>
</Tab>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 20em;
        align-items: flex-start;

        fieldset {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1rem;
        }

        h3,
        p {
            margin: 0;
        }

        input {
            opacity: 0;
            position: absolute;
            pointer-events: none;
        }

        label {
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;

            &:has(input:checked) {
                background-color: var(--bg-subtle);
            }
        }

        .theme-preview {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            div {
                display: flex;
                gap: 0.25rem;

                div {
                    width: 1rem;
                    height: 1rem;
                    border: 1px solid;
                    border-radius: 2px;
                }
            }

            .fg {
                background-color: var(--fg);
                border-color: var(--fg-subtle);
            }

            .bg {
                background-color: var(--bg);
                border-color: var(--bg-subtle);
            }

            .accent {
                background-color: var(--accent);
                border-color: var(--accent-subtle);
            }

            .warning {
                background-color: var(--warning);
                border-color: var(--warning-subtle);
            }
        }
    }
</style>
