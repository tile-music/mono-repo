<script lang="ts">
  import { goto } from "$app/navigation";

  /**
   * Asynchronous function to delete an account.
   * 
   * This function sends a POST request to the "/delete-account" endpoint with an empty JSON body.
   * It logs the response status and throws an error if the response is not OK.
   * 
   * @returns {Promise<Object>} The JSON response from the server if the request is successful.
   * @throws {Error} If the response status is not OK.
   */
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
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    await deleteAccount()

    await goto("/logout")
  }}
><slot /></button>

<style>
  button {
    border: 0;
    padding: 0;
    background-color: transparent;
  }
</style>
