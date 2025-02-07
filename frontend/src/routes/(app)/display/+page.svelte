<script lang="ts">
  // library imports
  import { onMount } from "svelte";
  import { deserialize } from "$app/forms";
  import { toPng } from "html-to-image";

  // component imports
  import Square from "./Square.svelte";
  import Context from "./Context.svelte";
  import Customize from "./Customize.svelte";
  // import Header from "./Header.svelte";

  // type & state imports
  import type { DisplayDataRequest } from "../../../../../lib/Request";
  import type { AlbumInfo, SongInfo } from "../../../../../lib/Song";
  import { filters } from "./filters.svelte";
  import { arrangement } from "./arrangement.svelte";

  let songs: { song: SongInfo; quantity: number }[] = $state([]);
  
  let iFrameRef: HTMLDivElement;
  let artDisplayRef: HTMLDivElement | null = $state(null);

  // download art display logic
  let displayContainerSize = $state({ width: 0, height: 0 });
  let displaySize = $derived(Math.min(
    displayContainerSize.width,
    displayContainerSize.height,
  ));

  async function captureDiv() {
    if(artDisplayRef) {
      try {
        artDisplayRef.style.transform = "scale(.95)";
        console.log(displaySize)
        // Capture the div as an image
        console.log(iFrameRef)
        
        const dataUrl = await toPng(iFrameRef/* , {filter: (element) => element.tagName == "button"} */);
        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "art-display";
        link.click();
        artDisplayRef.style.transform = "scale(1)";
      } catch (error) {
        console.error("Failed to capture div as image:", error);
      }
    } else {
      alert("No display to capture!")
    }
  }

  let refreshStatus:
    | { status: "refreshing" }
    | { status: "idle" }
    | { status: "error"; error: string } = $state({ status: "refreshing" });
  async function refresh(localFilters: DisplayDataRequest) {
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
        arrangement.generate()
      } else {
        refreshStatus = { status: "error", error: "no songs found! try a different filter." };
        songs = [];
      }
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
      songs = [];
    }
  }

  // context menu display logic
  let focusedAlbumInfo: {
    albumInfo: AlbumInfo,
    quantity: number,
    rank: number
  } | null = $state(null);

  function selectAlbum(albumInfo: AlbumInfo, quantity: number, rank: number) {
    focusedAlbumInfo = { albumInfo, quantity, rank }
  }

  // make initial data request upon load
  onMount(() => { refresh(filters) });
</script>

<div id="container">
  <Customize {refresh}
  regenerateDisplay={arrangement.generate}
  exportDisplay={captureDiv}/>
  <div
    id="display-container"
    bind:clientWidth={displayContainerSize.width}
    bind:clientHeight={displayContainerSize.height}
    bind:this={iFrameRef}
  >
    {#if arrangement.squares.length == 0 && refreshStatus.status == "idle"}
      <div
        id="placeholder-display"
        class="capture-area"
      >
        <h1>No listening data!</h1>
        <p>
          To generate a display, <a href="/link-spotify"
            >link your Spotify account</a
          > and listen to some music!
        </p>
      </div>
    {:else if refreshStatus.status == "idle"}
      <div
        id="display"
        class="capture-area"
        bind:this={artDisplayRef}
        style="{`width: ${displaySize}px; height: ${displaySize}px`}"
      >
        <!-- <Header nameSource="name" position={{top: 0, left: 0}}
        {dateStrings} {timeFrame} {filters}/> -->
        {#each arrangement.squares as square, i}
          <Square {square} song={songs[i].song}
           quantity={songs[i].quantity}
           rank={i+1}
           {selectAlbum}/>
        {/each}
      </div>
      {#if focusedAlbumInfo}
        <Context album={focusedAlbumInfo.albumInfo}
        quantity={focusedAlbumInfo.quantity}
        rank={focusedAlbumInfo.rank}
        {displayContainerSize} />
      {/if}
    {:else if refreshStatus.status == "refreshing"}
      <div
        id="placeholder-display"
        class="capture-area"
      >
        <h1>Loading...</h1>
      </div>
    {:else}
      <div
        id="placeholder-display"
        class="capture-area"
      >
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
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #display {
    aspect-ratio: 1 / 1 ;
    position: absolute;
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
</style>
