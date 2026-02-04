<script lang="ts">
    import { page } from "$app/state";
    import Tab from "./Tab.svelte";
</script>

<Tab name="Account & Security" id="tab-account-security">
    <p>Your email is <strong>{page.data.email}</strong></p>
</Tab>
