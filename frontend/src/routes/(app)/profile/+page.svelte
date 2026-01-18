<script lang="ts">
    import type { PageData } from "./$types";
    import Profile from "./panel/Profile.svelte";
    import Settings from "./settings/Settings.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { profile, email } = $derived(data);
</script>

<div id="container">
    <Profile profile={profile ? profile : undefined} />
    <Settings {email} />
</div>

<style>
    #container {
        display: flex;
        height: 100%;
        gap: 20px;
    }
</style>
