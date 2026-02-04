<script lang="ts">
    // library imports
    import { onMount } from "svelte";
    import { deserialize } from "$app/forms";

    // component imports
    import Square from "./Square.svelte";
    import Context from "./Context.svelte";
    import Header from "./Header.svelte";
    import Customize from "./Customize.svelte";
    // import Header from "./Header.svelte";

    // type & state imports
    import type { DisplayDataRequest } from "$shared/Request";
    import type { AlbumInfo } from "$shared/Song";
    import { setDisplayState, initializeDisplayState } from "./displayState";
    import { setArrangement, initArrangementContext } from "./arrangement";
    import type { AggregatedSongs } from "./arrangement";
    import type { PageData } from "./$types";

    // page data
    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    let { profile } = $derived(data);

    // initialize arrangement context
    const arrangement = $state(initArrangementContext());
    setArrangement(arrangement);
    const displayState = $state(initializeDisplayState());
    setDisplayState(displayState);
    const filters = $derived(displayState.filters);

    let songs: AggregatedSongs = $state([]);

    let iFrameRef: HTMLDivElement;
    let artDisplayRef: HTMLDivElement | null = $state(null);

    // derived state for display size
    let displayContainerSize = $state({ width: 0, height: 0 });
    let displaySize = $derived.by(() => {
        const containerAspectRatio =
            displayContainerSize.width / displayContainerSize.height;
        const displayAspectRatio =
            arrangement.squares.width / arrangement.squares.height;

        // if the container is smaller than the display, scale the display to fit
        return containerAspectRatio > displayAspectRatio
            ? {
                  height: 100,
                  width: (displayAspectRatio / containerAspectRatio) * 100,
              }
            : {
                  width: 100,
                  height: (containerAspectRatio / displayAspectRatio) * 100,
              };
    });

    let refreshStatus:
        | { status: "refreshing" }
        | { status: "idle" }
        | { status: "error"; error: string } = $state({ status: "refreshing" });
    async function refresh(localFilters: DisplayDataRequest): Promise<void> {
        // close popup
        focusedAlbumInfo = null;

        // send request
        refreshStatus = { status: "refreshing" };
        const res = await fetch("?/refresh", {
            method: "POST",
            body: JSON.stringify(localFilters),
        });

        // parse response
        const response = deserialize(await res.text());
        if (response.type === "success") {
            refreshStatus = { status: "idle" };
            songs = response.data!.songs as typeof songs;

            // modify filters to match localFilters
            filters.aggregate = localFilters.aggregate;
            filters.num_cells = localFilters.num_cells;
            filters.rank_determinant = localFilters.rank_determinant;
            filters.date = { ...localFilters.date };

            // generate new square arrangement
            if (songs) {
                arrangement.generate(arrangement, songs);
            } else {
                refreshStatus = {
                    status: "error",
                    error: "no songs found! try a different filter.",
                };
                songs = [];
            }
        } else if (response.type === "error") {
            refreshStatus = { status: "error", error: response.error.message };
            songs = [];
        }
    }

    /* context menu display logic
     we could make this a type that extends album info */

    let focusedAlbumInfo: {
        albumInfo: AlbumInfo;
        quantity: number;
        rank: number;
    } | null = $state(null);

    function selectAlbum(albumInfo: AlbumInfo, quantity: number, rank: number) {
        focusedAlbumInfo = { albumInfo, quantity, rank };
    }

    // make initial data request upon load
    onMount(() => {
        refresh(filters);
    });
</script>

<div id="container">
    <Customize {refresh} {songs} {profile} />
    <div
        id="display-container"
        bind:clientWidth={displayContainerSize.width}
        bind:clientHeight={displayContainerSize.height}
        bind:this={iFrameRef}
    >
        {#if arrangement.squares.list.length == 0 && refreshStatus.status == "idle"}
            <div id="placeholder-display">
                <h1>No listening data!</h1>
                <p>
                    To generate a display,
                    <a href="/link-spotify"> link your Spotify account </a>
                    and listen to some music!
                </p>
            </div>
        {:else if refreshStatus.status == "idle"}
            {#if profile}
                <Header {profile} />
            {/if}
            <div
                id="display"
                bind:this={artDisplayRef}
                style={`width: ${displaySize.width}%; height: ${displaySize.height}%`}
            >
                {#each arrangement.squares.list as square, i}
                    <Square
                        {square}
                        song={songs[i].song}
                        quantity={songs[i].quantity}
                        rank={i + 1}
                        context={arrangement.squares}
                        {selectAlbum}
                    />
                {/each}
            </div>
            {#if focusedAlbumInfo}
                <Context
                    album={focusedAlbumInfo.albumInfo}
                    quantity={focusedAlbumInfo.quantity}
                    rank={focusedAlbumInfo.rank}
                    {displayContainerSize}
                />
            {/if}
        {:else if refreshStatus.status == "refreshing"}
            <div id="placeholder-display">
                <h1>Loading...</h1>
            </div>
        {:else}
            <div id="placeholder-display">
                <h1>Error!</h1>
                <p>{refreshStatus.error}</p>
            </div>
        {/if}
    </div>
</div>

<style>
    #container {
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;
    }

    #display-container {
        min-width: 0;
        min-height: 0;
        flex: 1;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 20px;
    }

    #display {
        position: relative;
        flex-shrink: 0;
    }

    #placeholder-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    #placeholder-display p {
        width: 20em;
        text-align: center;
    }

    :global {
        #popover {
            z-index: 2;
        }
    }
</style>
