<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    import Song from './Song.svelte';

    import { processSongs } from './processSongs';
    const processedSongs = processSongs(data.songs);
</script>

<div id="container">
    <h1>Listening Data</h1>
    <div id="headers">
        <h2 id="art">art</h2>
        <h2 id="title">title</h2>
        <h2 id="artist">artist</h2>
        <h2 id="album">album</h2>
        <h2 id="duration">duration</h2>
        <h2 id="plays">plays</h2>
    </div>
    <div id="songs">
        {#if data.songs != null}
            {#each processedSongs as song}
                <Song {song} />
            {/each}
        {:else}
            <p>No listening data yet!</p>
        {/if}
    </div>
</div>

<style>
    #container {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    h1 {
        margin-bottom: 1em;
    }

    #headers {
        display: flex;
        padding: 1em 0 1em 40px;
        gap: 10px;
        position: sticky;
        top: 0;
        background-color: var(--background);
    }

    /* these values are manually synced with the Song component */
    #art {
        width: 50px;
    }

    #title, #album {
        width: 300px;
    }

    #artist {
        width: 200px;
    }

    #duration, #plays {
        width: 100px;
    }

    #songs {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
        min-height: 0;
    }
</style>