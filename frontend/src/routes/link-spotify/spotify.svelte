<script lang="ts">
  import spotify_logo from "$lib/assets/images/spotify_logo.png";

  import { goto } from "$app/navigation";
</script>

<button
  class="link_spotify"
  on:load={() => {
    goto("/check-spotify?link=true");
  }}
  on:click={() => {
    goto("/link-spotify?link=true");
  }}
  >log in with Spotify<img
    class="spotify_logo"
    src={spotify_logo}
    alt="The Spotify logo."
  /></button
>

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
