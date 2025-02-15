<script lang="ts">

    import type { SongInfo, AlbumInfo } from '../../../../../lib/Song';
    import refresh from '$lib/assets/icons/refresh.svg';
    import Song from "./Song.svelte"
    import { listeningDataFilter, filterColumnList, type ListeningDataSongInfo } from './filters.svelte';
    interface Props {
        song: ListeningDataSongInfo;
    }

    let { song }: Props = $props();
    let album : AlbumInfo = $derived(song.albums[0]);

    function calculateDuration(ms: number) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000);
        return minutes + ":" + (seconds < 9.5 ? '0' : '') + seconds.toFixed(0);
    }

</script>

<div class="song">
    <!-- {#if song.repetitions > 1}
        <p class="repetitions"><img src={refresh} alt="A replay icon">{song.repetitions}</p>
    {:else}
        <p class="repetitions"></p>
    {/if} -->
    {#if song.child}
        <Song song={song.child}/>
    {/if}
    <p class="repetitions"></p>
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
        {:else if column === "upc"}
            <p class={column}>{album.upc}</p>
        {:else if column === "spotify_album_id"}
            <p class={column}><a href="https://open.spotify.com/album/{album.spotify_id}">link</p>
        {:else if column === "spotify_track_id"}
            <p class={column}><a href="https://open.spotify.com/track/{song.spotify_id}">link</p>
        {:else}         
            <p class={column}>{song[column]}</p>
        {/if}
    {/each}
    

</div>

<style>
    @import "./styles.css";

    .repetitions img {
        width: 12px;
        height: 12px;
        transform: rotate(130deg);
        z-index: -1 /* ????? */
    }
</style>