<script lang="ts">
  import spotify_logo from "$lib/assets/images/spotify_logo.png";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let deleteAccount = async () =>
    fetch("/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(" "),
    })
      .then((response) => {
        console.log("Response status:", response.status); // Log status
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => console.error("Fetch error:", error));

</script>


  <button
    class="delete-account"
    name="DeleteAccount"
    on:click={async () => {
      await deleteAccount()
      await goto("/logout")
    }}
  > Delete Account
  </button>

<style>
  
</style>
