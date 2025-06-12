<script lang="ts">
    import { filters, filtersContext, generalOptions, getHeadingText } from "./filters.svelte";
    import type { Profile } from "$shared/Profile";

    interface Props {
        profile: Profile;
    }

    let {
        profile
    }: Props = $props();

    let headingText = $derived(
        getHeadingText(
            profile,
            generalOptions.headerOptions,
            filters,
            filtersContext
        )
    );
</script>

{#if generalOptions.headerOptions.showHeader}
    <div id="display-header">
        {#if generalOptions.headerOptions.showAvatar}
            <img src={profile.avatar_url} alt="Profile Avatar" width="50" height="50">
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
</style>