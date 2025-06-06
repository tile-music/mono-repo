<script lang="ts">
    import sampleAvatar from '$lib/assets/images/sample_avatar.jpg'
    import Avatar from './Avatar.svelte';
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import type { Profile } from "$shared/Profile";
    import { onMount } from 'svelte';
  
    interface Props {
        profile?: Profile;
    }

    let { profile }: Props = $props();
    let updatedProfile = $state<Profile | null>(null);

    onMount(() => {
        if (profile) updatedProfile = { ...profile }
    });
  
    let updateProfileStatus = $state("");
    const handleUpdateProfile: SubmitFunction = () => {
        return async ({ result }) => {
            if (result.type === "success") {
                // handle success
                updateProfileStatus = "updated successfully";
                window.location.href = window.location.href; // refresh page to show changes
            } else if (result.type === "failure") {
                // handle known errors
                if (!result.data || result.data.server_error)
                    updateProfileStatus = "failed to update profile: server error";
                else if (result.data.not_authenticated)
                    updateProfileStatus = "failed to update profile: not authenticated";
                else if (result.data.username_too_short)
                    updateProfileStatus = "failed to update profile: username must be at least 3 characters";
                else if (result.data.update_unnecessary)
                    updateProfileStatus = "change fields to update profile"
                else
                updateProfileStatus = "failed to update profile: unknown error";
            } else {
                // fallback for unknown result types
                updateProfileStatus = "failed to update profile: unknown error";
            }
        };
    }
</script>

<div id="profile">
    <h1>profile</h1>
    {#if updatedProfile} <!-- TODO: implement a static placeholder form if user is null -->
        <Avatar url={sampleAvatar} size={150} />
        <form method="POST" action="?/update_profile" use:enhance={handleUpdateProfile}>
            <div>
                <label for="username">username</label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="username"
                    bind:value={updatedProfile.username}
                />
            </div>
            <div>
            <label for="full name">full name</label>
                <input
                    type="text"
                    name="full name"
                    id="full name"
                    placeholder="full name"
                    bind:value={updatedProfile.full_name}
                />
            </div>
            <div>
                <label for="website">website</label>
                <input
                    type="text"
                    name="website"
                    id="website"
                    placeholder="website"
                    bind:value={updatedProfile.website}
                />
            </div>
            <p>{updateProfileStatus}</p>
            <input type="submit" value="save profile" />
        </form>
    {:else}
        <p id="loading-error">
            Unable to load profile information.
            Please try again later.
        </p>
    {/if}
</div>

<style>
    #profile {
        margin: auto;
        background-color: var(--midground);
        width: 300px;
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 40px;
    }

    #profile form {
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
    }

    #profile form div {
        width: 250px;
        display: flex;
        gap: 10px;
        align-items: center;
    }

    #profile form label {
        width: 5rem;
    }

    #profile form input {
        width: 150px;
        flex-grow: 1;
    }

    #profile form p {
        min-height: 40px;
        text-align: center;
    }
    
    #profile input[type="text"] {
        border: none;
        border-bottom: 2px solid var(--medium);
        border-radius: 0;
        background-color: transparent;
    }

    #loading-error {
        margin: 200px auto;
        width: 60%;
        line-height: 1.5;
        text-align: center;
    }
</style>