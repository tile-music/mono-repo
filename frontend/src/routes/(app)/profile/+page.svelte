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

  function setRoot() {
    let html = document.querySelector('html');
    if($theme == "light"){
      html?.style.setProperty("--background", "#e8e8e8")
      html?.style.setProperty("--text", "#000000")
      html?.style.setProperty("--medium", "#5c5853")
      html?.style.setProperty("--midground", "#787474")
      html?.style.setProperty("--accent", "#a54d17")      
    } else if ($theme == "dark") {
      html?.style.setProperty("--background", "#090808")
      html?.style.setProperty("--text", "#e5dfd0")
      html?.style.setProperty("--medium", "#5c5853")
      html?.style.setProperty("--midground", "#242222")
      html?.style.setProperty("--accent", "#e7762f")      
    } else if($theme == "dark-alt") {
      // html?.style.setProperty("--background", "--background-" + $theme)
      // html?.style.setProperty("--text", "--text-" + $theme)
      // html?.style.setProperty("--medium", "#5c5853")
      // html?.style.setProperty("--midground", "#242222")
      // html?.style.setProperty("--accent", "#e7762f") 
    }
  }

  async function setTheme(type : string) {
    $theme = type
    setRoot()
  }

  onMount(() => {
    console.log(data);
		setRoot();
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
  </div>
  <div id="themes">
    <button onclick={() => setTheme("light")} class="theme">
      Light
      <div class="inner-theme"></div>
      <div class="inner-theme"></div>
      <div class="inner-theme"></div>
    </button>
    <button onclick={() => setTheme("dark")} class="theme">Dark</button>
    <button class="theme">Fun Light</button>
    <button onclick={() => setTheme("dark-alt")} class="theme">Fun Dark</button>
    <p>{$theme}</p>
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
    width: 50%;
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

  .theme {
    width: 60px;
    height: 60px;
  }

  .inner-theme {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1px solid var(--text);
  }
</style>
