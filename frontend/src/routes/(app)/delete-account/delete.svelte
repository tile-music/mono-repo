<script lang="ts">
  import { goto } from "$app/navigation";
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  /**
   * Asynchronous function to delete an account.
   * 
   * This function sends a POST request (with the user's permission) to the "/delete-account" endpoint
   * with an empty JSON body. It logs the response status and throws an error if the response is not OK.
   * 
   * @returns {Promise<Object>} The JSON response from the server if the request is successful.
   * @throws {Error} If the response status is not OK.
   */
  async function deleteAccount() {
    // confirm with user
    if (!confirm("Are you sure you want to delete your account? " +
      "This action cannot be undone.")) return;
    
    const res = await fetch("/delete-account", {
      method: "POST",
      body: null,
    });

    if (res.status == 200) {
      goto('/logout');
    } else {
      const response = await res.json();
      console.error(response.error);
      goto('/profile');
    }
  }
</script>

<button class="delete-account" name="DeleteAccount" onclick={deleteAccount}>
  {@render children?.()}
</button>

<style>
  button {
    border: 0;
    padding: 0;
    background-color: transparent;
  }
</style>
