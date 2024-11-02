<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    import Song from './Song.svelte';
    import Loading from '$lib/assets/components/Loading.svelte';
</script>

<h1>Listening Data</h1>
<div class="songs">
    {#if data.songs != null}
        {#each data.songs as song}
            <Song {song} />
        {/each}
    {:else}
        <p>No listening data yet!</p>
    {/if}
</div>

<style>
    h1 {
        margin-bottom: 20px;
    }

    .songs {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
    }
</style>