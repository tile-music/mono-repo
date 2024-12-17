<script lang="ts">
    import type { ProcessOutput } from './processSongs';
    import type { SongInfo, AlbumInfo } from '../../../../../lib/Song';
    export let song: ProcessOutput;
    let album : AlbumInfo = song.albums[0];
    import refresh from '$lib/assets/icons/refresh.svg';
    $: album = song.albums[0];
    $: duration = calculateDuration(song.duration);

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
    <p class="title">{song.title}</p>
    <p class="artist">{song.artists.join(', ')}</p>
    <p class="album">{album.title}</p>
    <p class="duration">{duration}</p>
    <p class="plays">{song.plays}</p>
    <p class="listened_at">{new Date(song.listened_at).toLocaleString()}</p>
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
        display: flex;
        justify-content: center;
    }

    .art {
        height: 100%;
        aspect-ratio: 1 / 1;
    }

    .title, .album {
        width: 300px;
    }

    .artist {
        width: 200px;
    }

    .duration, .plays {
        width: 100px;
    }

    .repetitions {
        display: flex;
        gap: 5px;
        align-items: center;
    }   
    .listened_at{
        width: 300px;
    }

    .repetitions img {
        width: 12px;
        height: 12px;
        transform: rotate(130deg);
        z-index: -1 /* ????? */
    }
</style>