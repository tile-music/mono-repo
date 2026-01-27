<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        name: string;
        id: string;
        children: Snippet;
    }

    const { name, id, children }: Props = $props();
</script>

<section {id}>
    <h2>{name}</h2>
    <div class="tab-content">
        {@render children()}
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
    }

    h2 {
        border-bottom: 1px solid var(--border);
        margin: 0;
        padding-bottom: 1rem;
    }

    .tab-content {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
</style>
