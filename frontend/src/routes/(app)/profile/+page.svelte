<script lang="ts">
  import type { PageProps } from "./$types";
  import Profile from "./panel/Profile.svelte";
  import Settings from "./settings/Settings.svelte";

  let { data }: PageProps = $props();
  let { profile, email } = $derived(data);
</script>

<div id="container">
  <Profile {profile} />
  <Settings {email} />
</div>

<style>
  #container {
    display: flex;
    height: 100%;
    gap: 20px;
  }
</style>
