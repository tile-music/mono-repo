<script lang="ts">
    import type { ProcessOutput } from './processSongs';
    export let song: ProcessOutput;
    $: album = song.albums[0];
    $: duration = calculateDuration(song.duration);

    function calculateDuration(ms: number) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
    }
</script>

<div class="song">
    <p class="repetitions">{(song.repetitions > 1) ? "x" + song.repetitions : ""}</p>
    <img class="art" src={album.image} alt={`The album art for ${album.title} by ${album.artists.join(', ')}.`}>
    <p class="title">{song.title}</p>
    <p class="artist">{song.artists.join(', ')}</p>
    <p class="album">{album.title}</p>
    <p class="duration">{duration}</p>
    <p class="plays">{song.plays}</p>
</div>

<style>
    .song {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .repetitions {
        width: 30px;
        display: flex;
        justify-content: center;
    }

    .art {
        width: 50px;
        height: 50px;
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
</style>