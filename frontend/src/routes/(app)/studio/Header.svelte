<script lang="ts">
    import { getDisplayState, getHeadingText } from "./displayState";
    import type { Profile } from "$shared/Profile";

    const displayState = getDisplayState();

    const context = $derived(displayState.context);
    const filters = $derived(displayState.filters);
    const options = $derived(displayState.options);

    interface Props {
        profile: Profile;
    }

    let { profile }: Props = $props();

    let headingText = $derived(
        getHeadingText(profile, options.header, filters, context),
    );
</script>

{#if options.header.showHeader}
    <div id="display-header">
        {#if options.header.showAvatar}
            <img
                src={profile.avatar_url}
                alt="Profile Avatar"
                width="50"
                height="50"
            />
        {/if}
        <h1>{headingText}</h1>
    </div>
{/if}

<style>
    #display-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #display-header img {
        border-radius: 50%;
        object-fit: cover;
    }

    h1 {
        margin: 0;
    }
</style>
