<script lang="ts">
    import type { ProcessOutput } from './processSongs';
    import type { SongInfo, AlbumInfo } from '../../../../../lib/Song';
    import refresh from '$lib/assets/icons/refresh.svg';
    import { listeningColumns, filterColumnList } from './filters.svelte';
    interface Props {
        song: ProcessOutput;
    }

    let { song }: Props = $props();
    let album : AlbumInfo = $derived(song.albums[0]);

    function calculateDuration(ms: number) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
    }

</script>

<div class="song">
    {#if song.repetitions > 1}
        <p class="repetitions"><img src={refresh} alt="A replay icon">{song.repetitions}</p>
    {:else}
        <p class="repetitions"></p>
    {/if}
    <img class="art" src={album.image} alt={`The album art for ${album.title} by ${album.artists.join(', ')}.`}>
    {#each filterColumnList() as column}
        {#if column === 'duration'}
            <p class={column}>{calculateDuration(song[column])}</p>
        {:else if column === "album"}
            <p class={column}>{album.title}</p>
        {:else if column === "artist"}
            <p class={column}>{album.artists.join(', ')}</p>
        {:else if column === 'listened_at'}
            <p class={column}>{new Date(song[column]).toLocaleString()}</p>
        {:else}
            <p class={column}>{song[column]}</p>
        {/if}

    {/each}
    

</div>

<style>
    .song {
        display: flex;
        gap: 10px;
        align-items: center;
        height: 50px;
        flex-shrink: 0;
    }

    .repetitions {
        width: 50px;
        max-width: 50px;
        display: flex;
        justify-content: center;
    }

    .art {
        height: 100%;
        aspect-ratio: 1 / 1;
    }

    .title, .album {
        width: 300px;
        max-width: 300px;
    }

    .artist {
        width: 200px;
        max-width: 200px;
    }

    .listens {
        width: 100px;
        max-width: 100px;
    }
    .duration{
        width: 125px;
        max-width: 125px;
    }
    .listened_at{
        width: 200px
    }


    .repetitions {
        display: flex;
        gap: 5px;
        align-items: center;
    }

    .repetitions img {
        width: 12px;
        height: 12px;
        transform: rotate(130deg);
        z-index: -1 /* ????? */
    }
</style>