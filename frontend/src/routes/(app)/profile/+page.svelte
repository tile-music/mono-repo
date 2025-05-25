<script lang="ts">
  import type { PageData } from "./$types";
  import sampleAvatar from '$lib/assets/images/sample_avatar.jpg'
  import LinkSpotify from "../../link-spotify/spotify.svelte";
  import DeleteUser from "../delete-account/delete.svelte";
  import Avatar from './avatar.svelte';
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { browser } from '$app/environment';
  import ThemeButton from "./ThemeButton.svelte";

  interface Props {
    data: PageData;
  }

  let { data = $bindable() }: Props = $props();
  let { profile, email } = $derived(data);

  const all_themes = [
    "default-dark", "default-light",
    "faire", "mocha",
    "avocado", "myspace", "beads",
    "spotify"
  ]

  let resetProfileStatus = $state("");
  async function resetProfileInformation() {
    // confirm with user
    if (!confirm("Are you sure you want to reset your profile information? " +
      "This action cannot be undone.")) return;

    const res = await fetch('?/reset_profile', {
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data" }
    });

    // parse response
    const response = await res.json();
    const info = JSON.parse(response.data)[0]; // returns an array, for some reason

    // set status message
    if (info.success) {
      // refresh page
      resetProfileStatus = "reset successfully";
      window.location.href = window.location.href;
    }
    else if (info.not_authenticated) resetProfileStatus = "failed: not authenticated";
    else if (info.server_error) resetProfileStatus = "failed: server error";
    else resetProfileStatus = "failed: unknown error";
  }

  // very similar to the function above, but i'm keeping it separate
  // to allow for more robust error handling in the future
  let resetListeningStatus = $state("");
  async function resetListeningHistory() {
    // confirm with user
    if (!confirm("Are you sure you want to reset your listening history? " +
      "This action cannot be undone.")) return;

    const res = await fetch('?/reset_listening_data', {
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data" }
    });

    // parse response
    const response = await res.json();
    const data = JSON.parse(response.data)[0]; // returns an array, for some reason

    // set status message
    if (data.success) resetListeningStatus = "reset successfully";
    else if (data.no_action) resetListeningStatus = "no listening data found";
    else if (data.not_authenticated) resetListeningStatus = "failed: not authenticated";
    else if (data.server_error) resetListeningStatus = "failed: server error";
    else resetListeningStatus = "failed: unknown error";
  }

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

  let themeStatus = $state("");
  async function setProfileTheme(themeType : string) {
    const res = await fetch('?/update_theme', {
      method: 'POST',
      body: JSON.stringify(themeType)
    });

    // parse response
    const response = await res.json();
    const info = JSON.parse(response.data)[0]; // returns an array, for some reason

    // set status message
    if (info.success) {
      themeStatus = "theme update successful";
      applyTheme(themeType);
    }

    // handle errors
    else if (info.not_authenticated) themeStatus = "failed: not authenticated";
    else if (info.server_error) themeStatus = "failed: server error";
    else if (info.update_unnecessary) themeStatus = "theme already set to that value";
    else themeStatus = "failed: unknown error";
  }

  async function applyTheme(themeType: string) {
    // Set class on html element
    if (browser) document.documentElement.className = 
      document.documentElement.className.replace(
        /^theme-[^\s]*/, `theme-${themeType}`
      );
  }
</script>


<div id="container">
  <div id="profile">
    <h1>profile</h1>
    <Avatar url={sampleAvatar} size={150} />
    {#if profile} <!-- TODO: implement a static placeholder form if user is null -->
      <form method="POST" action="?/update_profile" use:enhance={handleUpdateProfile}>
        <div>
          <label for="username">username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username"
            bind:value={profile.username}
          />
        </div>
        <div>
          <label for="full name">full name</label>
          <input
            type="text"
            name="full name"
            id="full name"
            placeholder="full name"
            bind:value={profile.full_name}
          />
        </div>
        <div>
          <label for="website">website</label>
          <input
            type="text"
            name="website"
            id="website"
            placeholder="website"
            bind:value={profile.website}
          />
        </div>
        <p>{updateProfileStatus}</p>
        <input type="submit" value="save profile" />
      </form>
    {/if}
  </div>
  <div id="settings">
    <h1>account settings</h1>
    <div>
      <h2>email</h2>
      <p>your email is: <em>{email ?? "[no email found]"}</em>.</p>
    </div>
    <div>
      <h2>linked services</h2>
      <LinkSpotify></LinkSpotify>
    </div>
    <div id="account-actions">
      <h2>account actions</h2>
      <div class="button-status-group">
        <button class="link-button" onclick={resetListeningHistory}>reset listening history</button>
        <p role="status">{resetListeningStatus}</p>
      </div>
      <div class="button-status-group">
        <button class="link-button" onclick={resetProfileInformation}>reset profile information</button>
        <p role="status">{resetProfileStatus}</p>
      </div>
      <DeleteUser><div id="delete">delete account</div></DeleteUser>
    </div>
    <div class="theme-box">
      {#each all_themes as theme}
        <ThemeButton color={theme} setTheme={setProfileTheme}> </ThemeButton>
      {/each}
    </div>
    <p>{themeStatus}</p>
  </div>
</div>

<style>
  #container {
    display: flex;
    height: 100%;
    gap: 20px;
  }

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

  #settings {
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin: auto;
  }

  #settings>div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .link-button {
    margin: 0;
    padding: 0;
    border: none;
    font-family: "Archivo";
    background-color: transparent;
    color: var(--accent);
    text-decoration: underline;
    font-size: 16px;
    height: 24px;
    border-radius: 0;
    cursor: pointer;
  }

  #delete {
    height: 40px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    color: var(--background);
    background-color: var(--accent);
    font-family: "Mattone", sans-serif;
    font-size: 15px;
    padding: 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: -5px;
  }

  .button-status-group {
    display: flex;
    align-items: flex-end;
    gap: 20px;
  }

  .button-status-group p {
    margin-bottom: 3px; /* align status message with button */
  }

  .theme-box {
    max-width: 500px; /*This keeps the theme rows adaptabe but won't exceed 3 per row*/
    display: block !important;
    /* yes sam i know you hate !important but it's what works */
  }

</style>
