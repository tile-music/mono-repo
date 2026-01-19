<script lang="ts">
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { profile, email } = $derived(data);
</script>

<style>
</style>
