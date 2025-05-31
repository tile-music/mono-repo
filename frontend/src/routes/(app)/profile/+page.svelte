<script lang="ts">
  import type { PageData } from "./$types";
  import ProfilePanel from "./panel/ProfilePanel.svelte";
  import Settings from "./settings/Settings.svelte";

  interface Props {
    data: PageData;
  }

  let { data = $bindable() }: Props = $props();
  let { profile, email } = $derived(data);
</script>

<div id="container">
  <ProfilePanel {profile} />
  <Settings {email} />
</div>

<style>
  #container {
    display: flex;
    height: 100%;
    gap: 20px;
  }
</style>
