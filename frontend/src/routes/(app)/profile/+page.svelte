<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    import LinkSpotify from '../../link-spotify/spotify.svelte';
    import DeleteUser from '../delete-account/delete.svelte'
    $: ({ user } = data);
    let showSettings = true;
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

<div>
    <button id=settings-button on:click={() => showSettings = !showSettings}>
        {showSettings ? 'Hide Settings' : 'Show Settings'}
    </button>
    {#if showSettings}
        <div class="settings-menu">
            <LinkSpotify></LinkSpotify>
            <DeleteUser>   </DeleteUser>
        </div>
    {/if}
</div>


<style>
    #settings-button{
        margin-top:10px ;
    }
    .settings-menu {

        margin-top: 10px;
    }
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