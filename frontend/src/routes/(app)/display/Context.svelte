<script lang="ts">
    import type { AlbumInfo } from "../../../../../lib/Song";
    import type { DisplayDataRequest, ContextDataRequest, ContextDataResponse } from "../../../../../lib/Request";
    import type { TimeFrame, DateStrings } from "./filters";
    import { deserialize } from "$app/forms";

    // props
    export let album: AlbumInfo;
    export let quantity: number;
    export let rank: number;
    export let dateStrings: DateStrings;
    export let filters: DisplayDataRequest;
    export let timeFrame: TimeFrame;
    export let closeMenu: () => void;

    // computed state for metadata text
    $: artistsText = album.artists.length == 1 ? album.artists[0]
        : album.artists.slice(0, -1).join(", ") + " & " + album.artists[album.artists.length];

    $: altText = `Album art for ${album.title} by ${artistsText}`;

    $: rankText = `#${rank} most ${filters.rank_determinant == "time" ? "listened" : "played"} ` +
                  timeFrameToText(timeFrame, dateStrings);
    $: quantityText = filters.rank_determinant == "time" ?
                      toHoursAndMinutes(quantity) + " listened" :
                      quantity + " plays";
    
    export function timeFrameToText(tf: TimeFrame, ds: DateStrings) {
        switch (tf) {
            case "this-week": return "this week";
            case "this-month": return "this month";
            case "year-to-date": return "year to date";
            case "this-year": return "this year";
            case "all-time": return "of all time";
            case "custom": return customTimeFrameText(ds);
        }
    }

    function customTimeFrameText(ds: DateStrings) {
        if (ds.start == null && ds.end == null) return "of all time";
        else if (ds.start == null || ds.start == "") return "before " + ds.end;
        else if (ds.end == null || ds.end == "") return "after " + ds.start;
        else return `between ${ds.start} and ${ds.end}`;
    }

    function toHoursAndMinutes(ms: number) {
        const hours = Math.floor(ms/1000/60/60);
        const minutes = Math.floor((ms/1000/60/60 - hours)*60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    function toMinutesAndSeconds(ms: number) {
        const date = new Date(ms);
        return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, "0")}`;
    }

    // drag logic
    let position = {top: 0, left: 10};
    let moving = false;
    let dragTarget: HTMLElement;

    function onMouseDown(e: MouseEvent) {
        if (e.target as HTMLElement == dragTarget) moving = true;
    }

    function onMouseUp() { moving = false; }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            position.top += e.movementY;
            position.left += e.movementX;
        }
    }

    // form request logic
    async function fetchContextMenuData(upc: string): Promise<ContextDataResponse> {
        const request: ContextDataRequest = {
            upc,
            date: filters.date,
            rank_determinant: filters.rank_determinant
        }

        const res = await fetch("?/context", {
            method: "POST",
            body: JSON.stringify(request),
        });
        const response = deserialize(await res.text());

        if (response.type == "success") {
            return response.data as ContextDataResponse;
        } else if (response.type == "error") {
            console.log(response.error);
            throw response.error.message;
        } else {
            throw "Unknown error occurred.";
        }
    }

    // close logic
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener("click", handleClick, true);

        return { destroy() {
            document.removeEventListener("click", handleClick, true);
        } };
    }

    $: contextDataResponse = fetchContextMenuData(album.image);
</script>

<div id="context-menu" style={`top:${position.top}px; left:${position.left}px`}
    use:clickOutside>
    <div id="dragTarget" bind:this={dragTarget} on:mousedown={onMouseDown}
        role="button" tabindex={-1}>
        <div id="handle"></div>
    </div>
    <div id="metadata">
        <img src={album.image} alt={altText}>
        <div id="album-info">
            <h1 id="name">{album.title}</h1>
            <h2 id="artists">{artistsText}</h2>
            <p id="year">{album.release_year == null ? "Unknown release year" : album.release_year}</p>
            <p id="rank">{rankText} ({quantityText})</p>
        </div>
    </div>
    <table id="tracklist">
        <tr id="headers">
            <th class="title"><h2>Tracklist</h2></th>
            <th class="length"><h2>Length</h2></th>
            <th class="plays"><h2>Plays</h2></th>
        </tr>
        {#await contextDataResponse}
            <p>Waiting...</p>
            {#each {length: album.tracks - 1} as _}
                <tr>...</tr> <!-- placeholder songs to avoid jarring menu resize-->
            {/each}
        {:then response} 
            {#each response.songs as entry}
                <tr>
                    <td class="title">{entry.song.title}</td>
                    <td class="length">{toMinutesAndSeconds(entry.song.duration)}</td>
                    <td class="plays">{filters.rank_determinant == "time" ?
                        toHoursAndMinutes(entry.quantity) : entry.quantity}</td>
                </tr>
            {/each}
            {#if album.tracks !== response.songs.length}
                <p><em>+ {album.tracks - response.songs.length} unplayed songs</em></p>
            {/if}
        {:catch error}
            <p>Error: {error.toString()}</p>
        {/await}
    </table>
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove}/>

<style>
    img {
        object-fit: cover;
    }
    
    #context-menu {
        position: absolute;
        width: min(400px, 100%);
        height: min(600px, 100%);
        max-height: fit-content;
        padding: 7px 15px 15px 15px;
        background-color: var(--midground);
        display: flex;
        flex-direction: column;
        overflow: scroll;
        z-index: 10;
    }

    #dragTarget {
        cursor: move;
    }

    #handle {
        width: 100px;
        height: 6px;
        background-color: var(--medium);
        margin: 0 auto 7px auto;
        border-radius: 5px;
        pointer-events: none;
    }

    #metadata {
        display: flex;
        width: 100%;
        gap: 10px;
    }

    #context-menu img {
        width: 40%;
        aspect-ratio: 1/1;
    }

    #album-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    #artists {
        margin-bottom: 15px;
    }

    #tracklist {
        width: 100%;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0 10px;
    }

    th.title {
        width: auto;
    }

    th.length {
        width: 75px;
    }

    th.plays {
        width: 75px;
    }

    .title {
        text-align: left;
    }

    .length, .plays {
        text-align: right;
    }
</style>