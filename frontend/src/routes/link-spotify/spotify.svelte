<script lang="ts">
  import spotify_logo from "$lib/assets/images/spotify_logo.png";
  import {onMount} from "svelte"
  import { goto } from "$app/navigation";
  let enabled : boolean|null 
  onMount(() => {
    fetch("/check-spotify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(" ") // Adjust data as needed
    })
      .then((response) => {
        return response.json();
      })
      .then((data) =>{ 
        if(data.spotify === true) {
          enabled = false
        } else {
          enabled = true
        }
        console.log("data", data)})
  });
</script>

{#if enabled === true}
<button
  class="link_spotify"
  name="LinkSpotify"
    on:click={() =>  goto("/link-spotify?link=true")  }
  >log in with Spotify<img
  class="spotify_logo"
  src={spotify_logo}
  alt="The Spotify logo."
/></button>
{/if}


<style>
  .link_spotify {
    border: none;
    cursor: pointer;
    color: var(--background);
    font-family: "Mattone", sans-serif;
    font-size: 15px;
    height: 50px;
    width: 300px;
    border-radius: 10px;
    background-color: #1db954; /* spotify green*/
  }
  .spotify_logo {
    width: 30px;
    height: 30px;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

</style>
