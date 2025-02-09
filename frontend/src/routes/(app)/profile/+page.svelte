<script lang="ts">
  import type { PageData } from "./$types";
  import sampleAvatar from '$lib/assets/images/sample_avatar.jpg'
  import LinkSpotify from "../../link-spotify/spotify.svelte";
  import DeleteUser from "../delete-account/delete.svelte";
  import Avatar from './avatar.svelte';
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { theme } from '../../theme';
  import { onMount } from 'svelte';


  interface Props {
    data: PageData;
  }

  let { data = $bindable() }: Props = $props();
  let { user, email } = $derived(data);

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
      resetProfileStatus = "reset successfully";

      // reset profile information
      const userString = JSON.parse(response.data)[2];
      data.user = JSON.parse(userString);
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
      if (result.type === "success") updateProfileStatus = "updated successfully";
      else if (result.type === "failure") {
        if (!result.data || result.data.server_error)
          updateProfileStatus = "failed to update profile: server error";
        else if (result.data.not_authenticated)
          updateProfileStatus = "failed to update profile: not authenticated";
        else if (result.data.username_too_short)
          updateProfileStatus = "failed to update profile: username must be at least 3 characters";
        else if (result.data.update_unnecessary)
          updateProfileStatus = "change fields to update profile"
        else updateProfileStatus = "failed to update profile: unknown error";
      } else updateProfileStatus = "failed to update profile: unknown error"; // just in case
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
    }
    else if (info.not_authenticated) resetProfileStatus = "failed: not authenticated";
    else if (info.server_error) resetProfileStatus = "failed: server error";
    else resetProfileStatus = "failed: unknown error";
  }

  function setColors() {
    let html = document.querySelector('html');
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    html?.style.setProperty("--background", styles.getPropertyValue('--background-' + $theme))
    html?.style.setProperty("--text", styles.getPropertyValue('--text-' + $theme))
    html?.style.setProperty("--medium", styles.getPropertyValue('--medium-'  + $theme))
    html?.style.setProperty("--midground", styles.getPropertyValue('--midground-'  + $theme))
    html?.style.setProperty("--accent", styles.getPropertyValue('--accent-' + $theme)) 
  }

  async function setTheme(type : string) {
    $theme = type
    setColors()
    setProfileTheme(type)
  }

  onMount(() => {
    console.log(data);
    $theme = user?.theme //This is throwing a bullshit error but the code WORKS killing and biting. 
    // I've added the theme attribute to EVERY instance of user declaration
		setColors();
	});
</script>


<div id="container">
  <div id="profile">
    <h1>profile</h1>
    <Avatar url={sampleAvatar} size={150} />
    {#if user} <!-- TODO: implement a static placeholder form if user is null -->
      <form method="POST" action="?/update_profile" use:enhance={handleUpdateProfile}>
        <div>
          <label for="username">username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username"
            bind:value={user.username}
          />
        </div>
        <div>
          <label for="full name">full name</label>
          <input
            type="text"
            name="full name"
            id="full name"
            placeholder="full name"
            bind:value={user.full_name}
          />
        </div>
        <div>
          <label for="website">website</label>
          <input
            type="text"
            name="website"
            id="website"
            placeholder="website"
            bind:value={user.website}
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
      <p>your email is <em>{email ?? "[no email found]"}</em>.</p>
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
    <div class="theme-row">
      <button onclick={() => setTheme("light")} class="theme" id="light-theme">
        <p class="theme-text" style="color: var(--text-light);">light</p>
        <div class="inner-theme" style="background-color: var(--accent-light);"></div>
      </button>    
      <button onclick={() => setTheme("light-alt")} class="theme" id="light-alt-theme">
        <p class="theme-text" style="color: var(--text-light-alt);">alt light</p>
        <div class="inner-theme" style="background-color: var(--accent-light-alt);"></div>
      </button>
    </div>
    <div class="theme-row">
      <button onclick={() => setTheme("dark")} class="theme" id="dark-theme">
        <p class="theme-text" style="color: var(--text-dark);">dark</p>
        <div class="inner-theme" style="background-color: var(--accent-dark);"></div>
      </button>
      <button onclick={() => setTheme("dark-alt")} class="theme" id="dark-alt-theme">
        <p class="theme-text" style="color: var(--text-dark-alt);">alt dark</p>
        <div class="inner-theme" style="background-color: var(--accent-dark-alt);"></div>
      </button>
    </div>
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

  .theme-row {
    display: block !important;
    /* yes sam i know you hate !important but it's what works */
  }

  .theme {
    width: 110px;
    height: 45px;
    border-radius: 10px;
    margin-right: 20px;
    cursor: pointer;
    display: inline-block;
  }

  .theme-text {
    font-family: "Mattone", sans-serif;
    font-size: 17px;
    padding-top: 3px;
  }

  .inner-theme {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 15px;
  }

  #light-theme {
    background-color: var(--background-light);
    color: var(--text-light) !important;
    border: 3px solid var(--accent-light);
  }

  #dark-theme {
    background-color: var(--background-dark);
    color: var(--text-dark);
    border: 3px solid var(--accent-dark);
  }

  #dark-alt-theme {
    background-color: var(--background-dark-alt);
    color: var(--text-dark-alt);
    border: 3px solid var(--accent-dark-alt);
  }

  #light-alt-theme {
    background-color: var(--background-light-alt);
    color: var(--text-light-alt);
    border: 3px solid var(--accent-light-alt);
  }
</style>
