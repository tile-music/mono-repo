<script lang="ts">
    export let song: {
        album_art_path: string
        title: string
        artists: string[]
        album: string
    };
</script>

<div class="song">
    <img src={song.album_art_path} alt={`The album art for ${song.album}.`}>
    <p class="title">{song.title}</p>
    <p class="artist">{song.artists.join(', ')}</p>
    <p class="album">{song.album}</p>
</div>

<style>
    .song {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 5px;
        border: 2px solid var(--text);
    }

    img {
        width: 50px;
        height: 50px;
    }

    p {
        width: 150px;
    }
</style>