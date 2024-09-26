<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    import Song from './Song.svelte';
</script>

<h1>Listening Data</h1>
<div class="songs">
    {#each data.songs as song}
        <Song {song} />
    {/each}
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