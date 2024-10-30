<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    import Button from '../../link-spotify/spotify.svelte';
    $: ({ user } = data);
</script>

<form method="POST" action="?/update_profile">
    <label for="username">Username</label>
    <input type="text" name="username" id="username" placeholder="username" value={user?.username}>
    <label for="full_name">Full Name</label>
    <input type="text" name="full_name" id="full_name" placeholder="full name" value={user?.full_name}>
    <label for="website">Website</label>
    <input type="text" name="website" id="website" placeholder="website" value={user?.website}>
    <label for="avatar_url">Avatar URL</label>
    <input type="text" name="avatar_url" id="avatar_url" placeholder="avatar url" value={user?.avatar_url}>
    <input type="submit" value="edit profile">
</form>
<Button></Button>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
    /* .{
        padding: 10px;
    } */
</style>