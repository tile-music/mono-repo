<script lang="ts">
    import type { AlbumInfo } from "$shared/Song";
    import type {
        ContextDataRequest,
        ContextDataResponse,
    } from "$shared/Request";
    import { getDisplayState, timeFrameToText } from "./displayState";
    import { deserialize } from "$app/forms";

    const displayState = getDisplayState();
    const context = $derived(displayState.context);
    const filters = $derived(displayState.filters);

    interface Props {
        // props
        album: AlbumInfo;
        quantity: number;
        rank: number;
        displayContainerSize: { width: number; height: number };
    }

    let { album, quantity, rank, displayContainerSize }: Props = $props();

    const CLOSE_BUFFER_MS = 100;
    let title_size = $derived(30 - album.title.length / 5);

    function toHoursAndMinutes(ms: number) {
        const hours = Math.floor(ms / 1000 / 60 / 60);
        const minutes = Math.floor((ms / 1000 / 60 / 60 - hours) * 60);
        return `${hours}h ${minutes.toString()}m`;
    }

    function toMinutesAndSeconds(ms: number) {
        const date = new Date(ms);
        return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, "0")}`;
    }

    function listenedText(quantity: number) {
        if (filters.rank_determinant == "time") {
            return toHoursAndMinutes(quantity);
        } else if (quantity == 1) {
            return "1 play";
        } else {
            return quantity + " plays";
        }
    }

    // drag logic
    let position = $state({ top: 0, left: 10 });
    let size = $state({ width: 0, height: 0 });
    let moving = false;
    let dragTarget: HTMLElement;

    function onMouseDown(e: MouseEvent) {
        if ((e.target as HTMLElement) == dragTarget) {
            moving = true;
            canClose = false;
        }
    }

    function onMouseUp() {
        moving = false;
        setTimeout(() => (canClose = true), CLOSE_BUFFER_MS);
    }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            const maxTop = displayContainerSize.height - size.height;
            const maxLeft = displayContainerSize.width - size.width;
            position.top = Math.max(
                Math.min(position.top + e.movementY, maxTop),
                0,
            );
            position.left = Math.max(
                Math.min(position.left + e.movementX, maxLeft),
                0,
            );
        }
    }

    // form request logic
    async function fetchContextMenuData(
        upc: string,
    ): Promise<ContextDataResponse> {
        // hidden = false;
        // setTimeout(() => canClose = true, CLOSE_BUFFER_MS);
        const request: ContextDataRequest = {
            upc,
            date: filters.date,
            rank_determinant: filters.rank_determinant,
        };

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
            throw "unknown error occurred.";
        }
    }

    // close logic
    let hidden = $state(false);
    let canClose = true;
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node) && canClose) {
                hidden = true;
                canClose = false;
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }

    // computed state for metadata text
    let artistsText = $derived(
        album.artists.length == 1
            ? album.artists[0]
            : album.artists.slice(0, -1).join(", ") +
                  " & " +
                  album.artists[album.artists.length - 1],
    );

    let altText = $derived(`Album art for ${album.title} by ${artistsText}`);
    let rankText = $derived(
        `#${rank} most ${filters.rank_determinant == "time" ? "listened" : "played"} ` +
            timeFrameToText(context.timeFrame, context.dateStrings),
    );
    let quantityText = $derived.by(() => listenedText(quantity));

    // grab new context menu data every time the selected album changes
    let contextDataResponse: Promise<ContextDataResponse> = $state(
        fetchContextMenuData(album.image),
    );
    $effect(() => {
        contextDataResponse = fetchContextMenuData(album.image);
        hidden = false;
        setTimeout(() => (canClose = true), CLOSE_BUFFER_MS);
    });
</script>

<div
    id="context-menu"
    style={`top:${position.top}px; left:${position.left}px;`}
    class={hidden ? "hidden" : ""}
    bind:clientWidth={size.width}
    bind:clientHeight={size.height}
    use:clickOutside
>
    <div
        id="dragTarget"
        bind:this={dragTarget}
        onmousedown={onMouseDown}
        role="button"
        tabindex={-1}
    >
        <div id="handle"></div>
    </div>
    <div id="metadata">
        <img src={album.image} alt={altText} />
        <div id="album-info">
            <h1 id="name" style={`font-size: ${title_size}px;`}>
                {album.title}
            </h1>
            <h2 id="artists">{artistsText}</h2>
            <p id="year">
                {album.release_year == null
                    ? "unknown release year"
                    : album.release_year}
            </p>
            <p id="rank">{rankText} ({quantityText})</p>
        </div>
    </div>
    <table id="tracklist">
        <tbody>
            <tr id="headers">
                <th class="title"><h2>tracklist</h2></th>
                <th class="length"><h2>length</h2></th>
                <th class="listened"><h2>listened</h2></th>
            </tr>
            {#await contextDataResponse}
                <tr><td><p>waiting...</p></td></tr>
                {#each { length: album.tracks - 1 } as _}
                    <tr><td>...</td></tr>
                    <!-- placeholder songs to avoid jarring menu resize-->
                {/each}
            {:then response}
                {#each response.songs as entry}
                    <tr>
                        <td class="title">{entry.song.title}</td>
                        <td class="length"
                            >{toMinutesAndSeconds(entry.song.duration)}</td
                        >
                        <td class="listened">{listenedText(entry.quantity)}</td>
                    </tr>
                {/each}
                {#if album.tracks !== response.songs.length}
                    <tr
                        ><td
                            ><em
                                >+ {album.tracks - response.songs.length} unplayed
                                songs</em
                            ></td
                        ></tr
                    >
                {/if}
                <!-- {:catch error}
                <tr><td>Error: {() => {console.log(error); return error.toString()}}</td></tr> -->
            {/await}
        </tbody>
    </table>
</div>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />

<style>
    img {
        object-fit: cover;
    }

    #context-menu {
        position: absolute;
        width: min(400px, 100%);
        max-width: fit-content;
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

    th.listened {
        width: 100px;
    }

    .title {
        text-align: left;
    }

    .length,
    .listened {
        text-align: right;
    }
</style>
