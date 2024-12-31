<script lang="ts">
  import Square from "./Square.svelte";
  import type { DisplayDataRequest } from '../../../../../lib/Request';
  import { deserialize } from '$app/forms';
  import type { SongInfo } from '../../../../../lib/Song';
  import { onMount } from 'svelte';
  
  import { generateFullArrangement } from "./pack";

  import { toPng } from "html-to-image";
  let songs: { song: SongInfo, quantity: number }[] = [];
  
  let artDisplayRef: any;

  let displayContainerSize = {width: 0, height: 0};
  $: displaySize = Math.min(displayContainerSize.width, displayContainerSize.height);

  const filters: DisplayDataRequest = {
    aggregate: "album",
    num_cells: null,
    date: {start: null, end: null},
    rank_determinant: "listens"
  };

  let timeFrame: "this-week" | "this-month" | "year-to-date" | "this-year" | "all-time" = "all-time";

  // let dateStrings: {
  //   start: string | null,
  //   end: string | null
  // } = { start: null, end: null };

  let prevFilters: DisplayDataRequest;

  async function captureDiv() {
    try {
      // Capture the div as an image
      const dataUrl = await toPng(artDisplayRef);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "art-display.png";
      link.click();
    } catch (error) {
      console.error("Failed to capture div as image:", error);
    }
  }

  function makeSquares(maxSquares: number): { x: number; y: number; size: number }[] {
    // skip computation if no squares are being generated
    if (maxSquares == 0) return [];

    // 1 square requires no computation
    if (maxSquares == 1) return [{ x: 0, y: 0, size: 1 }];

    const max = Math.min(maxSquares, 14);
    const arrangement = generateFullArrangement(1, Math.max(max, 0), max, 0.0, 0.1);

    // translate the output of arrangement into a form usable by the Square component
    const squares: { x: number, y: number, size: number }[] = [];
    for (const square of arrangement) {
      squares.push({ x: square.x, y: square.y, size: square.width });
    }

    return squares;
  };

  let refreshStatus: {status: "refreshing"} |
    { status: "idle" } | { status: "error", error: string } = { status: "refreshing"};
  async function refresh() {
    console.log("refreshing");
    // set date range
    const startDate = new Date();

    if (timeFrame != "all-time") {
      switch (timeFrame) {
        case "this-week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "this-month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year-to-date":
          startDate.setFullYear(startDate.getFullYear(), 0, 1);
          break;
        case "this-year":
          startDate.setMonth(startDate.getMonth() - 12);
          break;
      }

      filters.date.start = startDate.getTime();
    } else {
      filters.date.start = null;
    }

    // send new data request only if filters have changed
    if (JSON.stringify(filters) == JSON.stringify(prevFilters)) return;

    // send request
    refreshStatus = { status: "refreshing" };
    const res = await fetch('?/refresh', {
      method: 'POST', body: JSON.stringify(filters)
    });

    // parse response
    const response = deserialize(await res.text());
    if (response.type === "success") {
      refreshStatus = { status: "idle" };
      songs = response.data!.songs as typeof songs;
      prevFilters = {...filters};
      prevFilters.date = {...filters.date};

      // generate new square arrangement
      squares = makeSquares(songs.length);
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message};
      songs = [];
    }
  }

  // generate initial square arrangement
  $: squares = makeSquares(songs.length);

  onMount(refresh);

  const toggleMenu = () => {
    console.log("clicked")
    const filters = document.getElementById("filters");
    const display = document.getElementById("display-container");
    const openMenu = document.getElementById("open-menu-header");
    console.log(`${filters}, ${JSON.stringify(filters?.style)}`);
    if(filters && display && openMenu) {
      if(filters.style.display == "flex" || filters.style.display == "") {
        filters.style.display = "none"
        display.style.width = "100%";
        openMenu.style.display = "inline";  
      } else {
        filters.style.display = "flex";
        display.style.width = "calc(100% - 300px)";
        openMenu.style.display = "none";
      } 
    } else if (!filters){
      throw Error("filters not found");
    } else if (!display){
      throw Error("display not found");
    } else if(!openMenu){
      throw Error("openMenu not found");
    }

  }
</script>

<div id="container">
  <div id="open-menu-header" >
    <button on:click={toggleMenu} id="open-menu" class="art-display-menu-button">menu</button>
  </div>
  <div id="filters">
    <div class="input-section">
      <div id="close-menu-header">
        <h1>Filters</h1>
        <button on:click={toggleMenu} id="close-menu" class="art-display-menu-button">close</button>
      </div>

      <h2>basic information</h2>
      <div class="labeled-input">
        <label for="music-type">music type</label>
        <select id="music-type" bind:value={filters.aggregate}  on:change={refresh}>
          <option value="song">song</option>
          <option value="album">album</option>
        </select>
      </div>
      <div class="labeled-input">
        <label for="time-frame">time frame</label>
        <select id="time-frame" bind:value={timeFrame} on:change={refresh}>
          <option value="this-week">this week</option>
          <option value="this-month">this month</option>
          <option value="year-to-date">year to date</option>
          <option value="this-year">this year</option>
          <option value="all-time">all time</option>
          <option value="custom">custom</option>
        </select>
      </div>
    </div>
    <div class="input-section">
      <h2>display size</h2>
      <div class="labeled-input">
        <label for="num-cells">number of cells</label>
        <input id="num-cells" type="number" name="num-cells"
          bind:value={filters.num_cells} on:blur={refresh} placeholder="max">
      </div>
      <div class="labeled-input">
        <label for="rank-determinant">rank determinant</label>
        <select id="rank-determinant" bind:value={filters.rank_determinant} on:change={refresh}>
          <option value="listens">listens</option>
          <option value="time">time</option>
        </select>
      </div>
    </div>
    <div id="lower-btns" style="">
      <button on:click={() => squares = makeSquares(songs.length)} id="regenerate"
        class="art-display-button" >Regenerate</button>
      <button on:click={captureDiv} class="art-display-button">Export</button>
    </div>
  </div>
  <div id="display-container"
    bind:clientWidth={displayContainerSize.width}
    bind:clientHeight={displayContainerSize.height}
  >
    {#if squares.length == 0 && refreshStatus.status == "idle"}
      <div id="placeholder-display" bind:this={artDisplayRef} class="capture-area">
        <h1>No listening data!</h1>
        <p>To generate a display, <a href="/link-spotify">link your Spotify account</a> and listen to some music!</p>
      </div>
    {:else}
      {#if refreshStatus.status == "idle"}
        <div id="display" bind:this={artDisplayRef} class="capture-area"
          style={`width: ${displaySize}px; height: ${displaySize}px`}}>
          {#each squares as square, i}
            <Square {square} song={songs[i].song} />
          {/each}
        </div>
      {:else if refreshStatus.status == "refreshing"}
        <div id="placeholder-display" bind:this={artDisplayRef} class="capture-area">
          <h1>Loading...</h1>
        </div>
      {:else}
        <div id="placeholder-display" bind:this={artDisplayRef} class="capture-area">
          <h1>Error!</h1>
          <p>{refreshStatus.error}</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  #close-menu-header {
    max-width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #open-menu-header {
    display: none;
    position: absolute;
    top: .8;
    left: .5;
    z-index: 1;
  }
  #lower-btns {
    display: flex; 
    gap: 20px;
    margin-top: auto;
  }
  
  #container {
    width: 100%;
    height: 100%;
    display: flex;
  }

  #filters {
    display: flex;
    width: 30%;
    min-width: 300px;
    flex-direction: column;
    gap: 30px;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .labeled-input {
    display: flex;
    align-items: center;
  }

  .labeled-input label {
      width: 150px;
  }

  #display-container {
    width: calc(100% - 300px);
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #display {
    aspect-ratio: 1 / 1;
    position: relative;
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

  select, input[type="number"] {
    background-color: var(--background);
    border: 0;
    border-bottom: 2px solid var(--medium);
    font-family: "Archivo", sans-serif;
    font-size: 15px;
    padding: 0 2px; /* compensate for border */
    color: var(--text);
  }

  select {
    width: 100px;
  }

  input[type="number"] {
    width: 60px;
  }

  select:hover, select:focus, input:hover, input:focus {
    outline: none;
    background-color: var(--midground);
  }
</style>
