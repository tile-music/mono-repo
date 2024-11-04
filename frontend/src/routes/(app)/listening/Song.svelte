<script lang="ts">
    import type { SongInfo, AlbumInfo } from '../../../../../lib/Song';
    export let song: SongInfo;
    let album : AlbumInfo = song.albums[0];
</script>

<div class="song">
    <img src={album.image} alt={`The album art for ${album.title} by ${album.artists.join(', ')}.`}>
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