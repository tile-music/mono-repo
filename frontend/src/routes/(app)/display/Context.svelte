<script lang="ts">
    import type { AlbumInfo } from "../../../../../lib/Song";
    import type { DisplayDataRequest, ContextDataRequest, ContextDataResponse } from "../../../../../lib/Request";
    import type { TimeFrame, DateStrings } from "./filters";
    import { timeFrameToText } from "./filters";
    import { deserialize } from "$app/forms";

    // props
    export let album: AlbumInfo;
    export let quantity: number;
    export let rank: number;
    export let dateStrings: DateStrings;
    export let filters: DisplayDataRequest;
    export let timeFrame: TimeFrame;
    export let displayContainerSize: {width: number, height: number};

    const CLOSE_BUFFER_MS = 100;

    // computed state for metadata text
    $: artistsText = album.artists.length == 1 ? album.artists[0]
        : album.artists.slice(0, -1).join(", ") + " & " + album.artists[album.artists.length];

    $: altText = `Album art for ${album.title} by ${artistsText}`;

    $: rankText = `#${rank} most ${filters.rank_determinant == "time" ? "listened" : "played"} ` +
                  timeFrameToText(timeFrame, dateStrings);
    $: quantityText = filters.rank_determinant == "time" ?
                      toHoursAndMinutes(quantity) + " listened" :
                      quantity + " plays";

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
    let size = { width: 0, height: 0};
    let moving = false;
    let dragTarget: HTMLElement;

    function onMouseDown(e: MouseEvent) {
        if (e.target as HTMLElement == dragTarget) {
            moving = true;
            canClose = false;
        }
    }

    function onMouseUp() {
        moving = false;
        setTimeout(() => canClose = true, CLOSE_BUFFER_MS);
    }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            const maxTop = displayContainerSize.height - size.height;
            const maxLeft = displayContainerSize.width - size.width;
            position.top = Math.max(Math.min(position.top + e.movementY, maxTop), 0);
            position.left = Math.max(Math.min(position.left + e.movementX, maxLeft), 0);
        }
    }

    // form request logic
    async function fetchContextMenuData(upc: string): Promise<ContextDataResponse> {
        hidden = false;
        setTimeout(() => canClose = true, CLOSE_BUFFER_MS);
        
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
    let hidden = false;
    let canClose = true;
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node) && canClose) {
                hidden = true;
                canClose = false;
            }
        };

        document.addEventListener("click", handleClick, true);

        return { destroy() {
            document.removeEventListener("click", handleClick, true);
        } };
    }

    $: contextDataResponse = fetchContextMenuData(album.image);
</script>

<div id="context-menu" style={`top:${position.top}px; left:${position.left}px;`}
    class={hidden ? "hidden" : ""} bind:clientWidth={size.width} bind:clientHeight={size.height}
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

    #context-menu.hidden {
        display: none;
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