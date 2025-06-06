<script lang="ts">
    import { filters, filtersContext, timeFrameToText, generalOptions } from "./filters.svelte";
    import type { Profile } from "$shared/Profile";

    interface Props {
        profile: Profile;
    }

    let {
        profile
    }: Props = $props();

    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    function toTitleCase(str: string) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    let nameText = $derived(
        (generalOptions.headerOptions.nameSource == "name" ?
            profile.full_name : profile.username) + "'s"
    );
    let headingText = $derived(toTitleCase(`${nameText} top ${filters.aggregate + "s"} ` +
                     timeFrameToText(filtersContext.timeFrame, filtersContext.dateStrings)));
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