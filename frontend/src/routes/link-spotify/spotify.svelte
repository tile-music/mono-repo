<script lang="ts">
  import spotify_logo from "$lib/assets/images/spotify_logo.png";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { writable } from "svelte/store";
  type SpotifyStatus = {status: "true"| "false" | "loading"};
  let enabled = writable<SpotifyStatus>({status: "loading"});
  /**
   * Asynchronously checks the Spotify login status by sending a POST request to the "/check-spotify" endpoint.
   * 
   * The function performs the following steps:
   * 1. Sends a POST request with an empty JSON body to the "/check-spotify" endpoint.
   * 2. Logs the response status to the console.
   * 3. If the response is not OK, throws an error with the HTTP status.
   * 4. Parses the response JSON data.
   * 5. Logs the parsed data to the console.
   * 6. Checks if the parsed data indicates that Spotify is logged in.
   *    - If "spotify logged in", logs a message and sets the `enabled` store to `false`.
   *    - Otherwise, logs a different message and sets the `enabled` store to `true`.
   * 7. Catches and logs any errors that occur during the fetch operation.
   */
  let checkSpotify = async () =>{

    enabled.set({status: "loading"})
    await fetch("/check-spotify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(" "),
    })
      .then((response) => {
        //console.log("Response status:", response.status); // Log status
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        //console.log("Parsed data:", data);
        if (data === "spotify logged in") {
          //console.log("should be disabled");
          enabled.set({status: "true"});
        } else {
          //console.log("not true");
          enabled.set({status: "false"});
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }

  onMount(async () => {
    if($enabled.status === "loading"){
      await checkSpotify(); 
    }
  });

  //$: console.log("enabled", $enabled);
</script>

{#if $enabled.status === "false"}
  <button
    class="link_spotify"
    name="LinkSpotify"
    onclick={async () => {
      await goto("/link-spotify?link=true");
      setTimeout(async () => {
        await checkSpotify();
      }, 1000);
    }}

  >
    log in with Spotify
    <img class="spotify_logo" src={spotify_logo} alt="The Spotify logo." />
  </button>
{:else if $enabled.status === "true"}
<!-- this could be deduplicated, im just not totally sure how right now -->
  <button
    class="link_spotify"
    id="unlink_spotify"
    name="UnlinkSpotify"
    onclick={async () => {
      await fetch("/unlink-spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(" "),
      })  
      await checkSpotify();
    }}>unlink spotify account</button
  >
{:else}
  <button  class="link_spotify" disabled>loading...</button>
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
  #unlink_spotify{
    background-color: #FF4B4B;
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
