<script lang="ts">
    import AccountForm from "../AccountForm.svelte";
    import type { ActionData } from "./$types";
    let { form }: { form: ActionData } = $props();
</script>

<AccountForm {form} type={"login"} />
