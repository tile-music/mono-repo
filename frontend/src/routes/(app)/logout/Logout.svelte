<script>
  import { redirect } from '@sveltejs/kit';
  const logout = async () =>{
    throw redirect(307, "/logout");
  }
</script>

<style>
  /* You can add any necessary styles here */
</style>

<div>
  <a href="/logout" on:click={logout}>logout</a>
</div>