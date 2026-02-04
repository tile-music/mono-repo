<script lang="ts">
    import type { PageData } from "./$types";
    import Avatar from "$lib/components/Avatar.svelte";

    import AccountSecurity from "./tabs/AccountSecurity.svelte";
    import Appearance from "./tabs/Appearance.svelte";
    import BasicInformation from "./tabs/BasicInformation.svelte";
    import LinkedServices from "./tabs/LinkedServices.svelte";
    import MyData from "./tabs/MyData.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { profile, email } = $derived(data);

    let formattedWebsite = $derived.by(() => {
        // add http or https to website url
        if (
            !profile.website.startsWith("http://") &&
            !profile.website.startsWith("https://")
        ) {
            return "https://" + profile.website;
        }
        return profile.website;
    });
</script>

<main>
    <div id="tabs">
        <section id="preview">
            <Avatar {profile} size={128} />
            <div>
                <h3>{profile.full_name}</h3>
                <span>{profile.username}</span>
                {#if profile.website}
                    <a href={formattedWebsite}>{profile.website}</a>
                {/if}
            </div>
        </section>
        <fieldset role="radiogroup">
            <label>
                <input type="radio" name="tab" id="basic-information" checked />
                Basic Information
            </label>
            <label>
                <input type="radio" name="tab" id="account-security" />
                Account & Security
            </label>
            <label>
                <input type="radio" name="tab" id="linked-services" />
                Linked Services
            </label>
            <label>
                <input type="radio" name="tab" id="my-data" />
                My Data
            </label>
            <label>
                <input type="radio" name="tab" id="appearance" />
                Appearance
            </label>
        </fieldset>
    </div>
    <section id="content">
        <AccountSecurity />
        <Appearance />
        <BasicInformation />
        <LinkedServices />
        <MyData />
    </section>
</main>

<style>
    main {
        display: flex;
        gap: 2rem;
    }

    @media (max-width: 700px) {
        main {
            flex-direction: column;
        }

        :global(.tab-content) {
            overflow-y: initial;
        }
    }

    #tabs {
        display: flex;
        flex-direction: column;
        gap: 2em;
        width: 20em;
    }

    #preview {
        display: flex;
        gap: 1rem;

        div {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            h3 {
                margin: 0;
            }
        }
    }

    fieldset {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
            cursor: pointer;
            position: relative;
            padding: 0.4rem 0.8rem;
            border-radius: 5px;

            &:has(input:checked) {
                background-color: var(--bg-subtle);

                &::after {
                    width: 4px;
                    height: 80%;
                    border-radius: 2px;
                    background-color: var(--accent);
                    position: absolute;
                    left: -8px;
                    top: 10%;
                    display: block;
                    content: "";
                }
            }

            &:hover {
                background-color: var(--bg-subtle);
            }
        }

        input {
            opacity: 0;
            position: absolute;
            pointer-events: none;
        }
    }

    :global {
        body:has(#account-security:not(:checked)) #tab-account-security,
        body:has(#appearance:not(:checked)) #tab-appearance,
        body:has(#basic-information:not(:checked)) #tab-basic-information,
        body:has(#linked-services:not(:checked)) #tab-linked-services,
        body:has(#my-data:not(:checked)) #tab-my-data {
            display: none;
        }
    }

    #content {
        flex-grow: 1;
    }
</style>
