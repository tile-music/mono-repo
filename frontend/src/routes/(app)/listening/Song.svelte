<script lang="ts">
    import type {
        SongInfo,
        AlbumInfo,
        ListeningDataSongInfo,
    } from "../../../../../lib/Song";
    import refresh from "$lib/assets/icons/refresh.svg";
    import arrow from "$lib/assets/icons/down-arrow-56.svg";
    import Song from "./Song.svelte";
    import { listeningDataFilter, filterColumnList } from "./filters.svelte";
    interface Props {
        song: ListeningDataSongInfo;
        childPropagation: (song: ListeningDataSongInfo) => void;
    }

    let { song, childPropagation }: Props = $props();
    let album: AlbumInfo = $derived(song.albums[0]);
    let dropdown: HTMLImageElement = $state();

    function calculateDuration(ms: number) {
        const minutes = Math.floor(ms / 60000);
        const seconds = (ms % 60000) / 1000;
        return minutes + ":" + (seconds < 9.5 ? "0" : "") + seconds.toFixed(0);
    }
    /**
     * This function wraps the childPropagation callback which is located in listening/+page.svelte.
     * It calls the childPropagation function with the provided song and toggles the rotation of a dropdown element.
     * 
     * @param {ListeningDataSongInfo} song - The song information to be propagated.
     */
    /**
     * this function wraps the childPropogation callback which is located in listening/+page.svelte
     * @param song
     */
    function childPropogationRotation(song : ListeningDataSongInfo){
        childPropagation(song)
        if(dropdown){
            console.log(dropdown.style.transform )
            if(dropdown.style.transform === "" || dropdown.style.transform == "rotate(270deg)") dropdown.style.transform = "rotate(0deg)"
            else dropdown.style.transform = "rotate(270deg)"
        }
    }
</script>

<div class="song">
    {#if song.is_parent}
        <p class="repetitions" onclick={() =>{ childPropogationRotation(song) }}>
            <img src={arrow} bind:this={dropdown}  alt="show plays" />({song.size + 1})
        </p>
    {:else}
        <p class="repetitions"></p>
    {/if}

    {#if !song.is_child}
        <img
            class="art"
            src={album.image}
            alt={`The album art for ${album.title} by ${album.artists.join(", ")}.`}
        />
    {:else}
        <div class="art" id="vertical_line"></div>
    {/if}

    {#each filterColumnList() as column}
        {#if column === "duration"}
            <p class={column}>{calculateDuration(song[column])}</p>
        {:else if column === "album"}
            <p class={column}>{album.title}</p>
        {:else if column === "artist"}
            <p class={column}>{album.artists.join(", ")}</p>
        {:else if column === "listened_at"}
            <p class={column}>{new Date(song[column]).toLocaleString()}</p>
        {:else if column === "upc"}
            <p class={column}>{album.upc}</p>
        {:else if column === "spotify_album_id"}
            <p class={column}>
                <a href="https://open.spotify.com/album/{album.spotify_id}"
                    >link</a
                >
            </p>
        {:else if column === "spotify_track_id"}
            <p class={column}>
                <a href="https://open.spotify.com/track/{song.spotify_id}"
                    >link</a
                >
            </p>
        {:else}
            <p class={column}>{song[column]}</p>
        {/if}
    {/each}
</div>

{#if song.child && song.show_children}
    <div id="children">
        <Song song={song.child} {childPropagation} id="song" />
    </div>
{/if}

<style>
    @import "./styles.css";
    #children {
        display: flex;
        flex-direction: column;
        padding-right: 20px;
    }

    .repetitions img {
        z-index: -1;
        height: 30px;
        width: auto;
        transform: rotate(270deg);
    }
    img {
        color: var(--text);
    }
    #song {
        height: 50px;
    }
    svg{
        filter: var(--text)
    }
    #vertical_line {
        background-image: linear-gradient(var(--text), var(--text));
        background-size: 2px 100%;
        background-repeat: no-repeat;
        background-position: center center;
    }
</style>
