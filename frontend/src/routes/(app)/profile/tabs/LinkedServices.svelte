<script lang="ts">
    import Tab from "./Tab.svelte";
    import LoginSpotify from "$lib/components/LoginSpotify.svelte";
</script>

<Tab name="Linked Services" id="tab-linked-services">
    <LoginSpotify next="/profile" linkIdentity />
</Tab>
