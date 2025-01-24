<script lang="ts">
    import type { PageData } from './$types';
    import Song from './Song.svelte';

    import { processSongs } from './processSongs';
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<div id="container">
    <h1>Listening Data</h1>
    <div id="scroll-container">
        {#if data.songs != null}
            <div id="headers">
                <h2 id="art">art</h2>
                <h2 id="title">title</h2>
                <h2 id="artist">artist</h2>
                <h2 id="album">album</h2>
                <h2 id="duration">duration</h2>
                <h2 id="plays">plays</h2>
            </div>
            <div id="songs">
                    {#each processSongs(data.songs) as song}
                        <Song {song} />
                    {/each}
            </div>
        {:else}
            <p>No listening data yet!</p>
        {/if}
    </div>
</div>

<style>
    #container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    #scroll-container {
        overflow-x: scroll;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    h1 {
        margin-bottom: 1em;
    }

    #headers {
        display: flex;
        padding: 1em 0 1em 60px;
        width: fit-content;
        gap: 10px;
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
        margin-bottom: 20px;
        overflow-y: scroll;
        width: fit-content;
    }
</style>