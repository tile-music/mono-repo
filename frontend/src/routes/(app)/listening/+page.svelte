<script lang="ts">

    import Song from "./Song.svelte";
    import { processSongs } from "./processSongs";
    import type {ListeningDataReqPerams} from "../../../../../lib/ListeningDataReqPerams";
    import DatePickers from "../../date-picker/DatePickers.svelte";
    import  dateRangeObj  from "../../date-picker/DatePickers.svelte";
    import { onMount } from "svelte";

    let listeningData: any = null;
    onMount(async () => await getData(dateRangeObj));
    const getData = async (listeningDataReqPerams:any): Promise<any> => {
        console.log("listeningDataReqPerams", listeningDataReqPerams);
        const response = await fetch("/get-listening", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(listeningDataReqPerams),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        listeningData = await response.json();
        
    }

    let sortBy = { col: "listened_at", asc: false };
    $: sortByHelper = (colName: string) =>
        colName === sortBy.col ? (sortBy.asc ? "▲" : "▼") : "";
    $: songs = processSongs(listeningData.songs);
    $: sort = (column: string) => {
        if (sortBy.col == column) {
            sortBy.asc = !sortBy.asc;
        } else {
            sortBy.col = column;
            sortBy.asc = true;
        }

        // Modifier to sorting function for ascending or descending
        let sortModifier = sortBy.asc ? 1 : -1;

        let sort = (a: { [key: string]: any }, b: { [key: string]: any }) =>
            a[column] < b[column]
                ? -1 * sortModifier
                : a[column] > b[column]
                  ? 1 * sortModifier
                  : 0;

        songs = songs.sort(sort);
    };
</script>

<div id="container">
    <div id="listening-data-menu">
        <h1>Listening Data</h1>
        <DatePickers></DatePickers>

    </div>

    <div id="scroll-container">
        {#if songs != null}
            <div id="headers">
                <h2 id="art">art</h2>
                <button
                    id="title"
                    on:click={() => sort("title")}
                    aria-label="Sort by title"
                    ><h2>title {sortByHelper("title")}</h2></button
                >
                <button
                    id="artist"
                    on:click={() => sort("artists")}
                    aria-label="Sort by artist"
                    ><h2>artist {sortByHelper("artists")}</h2></button
                >
                <button
                    id="album"
                    on:click={() => sort("album_title")}
                    aria-label="Sort by album"
                    ><h2>album {sortByHelper("album_title")}</h2></button
                >
                <button
                    id="duration"
                    on:click={() => sort("duration")}
                    aria-label="Sort by duration"
                    ><h2>duration {sortByHelper("duration")}</h2></button
                >
                <button
                    id="plays"
                    on:click={() => sort("plays")}
                    aria-label="Sort by plays"
                    ><h2>plays {sortByHelper("plays")}</h2></button
                >
                <button
                    id="listened_at"
                    on:click={() => sort("listened_at")}
                    aria-label="Sort by played at"
                    ><h2>played at {sortByHelper("listened_at")}</h2></button
                >
            </div>
            <div id="songs">
                {#each songs as song}
                    <Song {song} />
                {/each}
            </div>
        {:else}
            <p>No listening data yet!</p>
        {/if}
    </div>
</div>

<style>
    /* a{
        text-align: left;
    } */
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
    /* this is temporary  */

    h1 {
        margin-bottom: 1em;
    }

    button {
        all: unset;
    }

    #headers {
        display: flex;
        padding: 1em 0 1em 60px;
        width: fit-content;
        gap: 10px;
    }

    /* these values are manually synced with the Song component
        * why? 
        @Todo: sync them
        
    */
    #art {
        width: 50px;
    }

    #title,
    #album {
        width: 300px;
    }

    #artist {
        width: 200px;
    }

    #duration {
        width: 110px;
    }
    #plays {
        width: 100px;
    }
    #listened_at {
        width: 200px;
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
