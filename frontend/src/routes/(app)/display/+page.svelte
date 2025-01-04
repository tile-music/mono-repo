<script lang="ts">
  import Square from "./Square.svelte";
  import type { DisplayDataRequest } from "../../../../../lib/Request";
  import { deserialize } from "$app/forms";
  import type { SongInfo } from "../../../../../lib/Song";
  import { onMount } from "svelte";

  import { generateFullArrangement } from "./pack";

  import { toPng } from "html-to-image";

  let songs: { song: SongInfo; quantity: number }[] = [];

  let artDisplayRef: any;

  let displayContainerSize = { width: 0, height: 0 };
  $: displaySize = Math.min(
    displayContainerSize.width,
    displayContainerSize.height,
  );

  const filters: DisplayDataRequest = {
    aggregate: "album",
    num_cells: null,
    date: { start: null, end: null },
    rank_determinant: "listens",
  };

  let timeFrame:
    | "this-week"
    | "this-month"
    | "year-to-date"
    | "this-year"
    | "all-time"
    | "custom" = "all-time";

  let dateStrings: {
    start: string | null;
    end: string | null;
  } = { start: null, end: null };

  let filterVisibility = true;

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

  function makeSquares(
    maxSquares: number,
  ): { x: number; y: number; size: number }[] {
    // skip computation if no squares are being generated
    if (maxSquares == 0) return [];

    // 1 square requires no computation
    if (maxSquares == 1) return [{ x: 0, y: 0, size: 1 }];

    const max = Math.min(maxSquares, 14);
    const arrangement = generateFullArrangement(
      1,
      Math.max(max, 0),
      max,
      0.0,
      0.1,
    );

    // translate the output of arrangement into a form usable by the Square component
    const squares: { x: number; y: number; size: number }[] = [];
    for (const square of arrangement) {
      squares.push({ x: square.x, y: square.y, size: square.width });
    }

    return squares;
  }

  // stores the filters used for the previous server request.
  // used to make sure changes were made before sending subsequent reqiests.
  let prevFilters: DisplayDataRequest;

  let refreshStatus:
    | { status: "refreshing" }
    | { status: "idle" }
    | { status: "error"; error: string } = { status: "refreshing" };
  async function refresh() {
    //console.log("refreshing");
    // set date range
    const startDate = new Date();
    const endDate = new Date();

    if (timeFrame != "custom") {
      dateStrings.start = null;
      dateStrings.end = null;
    }
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
        case "custom":
          if (
            !(dateStrings.start?.split("-").length == 3) &&
            !(dateStrings.end?.split("-").length == 3)
          ) {
            return;
          } else {
            //console.log(dateStrings);
            dateStrings.start
              ? startDate.setTime(new Date(dateStrings.start).valueOf())
              : null;
            dateStrings.end
              ? endDate.setTime(new Date(dateStrings.end).valueOf())
              : null;
            break;
          }
        default:
          throw Error("invalid time frame selection");
      }
      //console.log(`start: ${startDate.toISOString()} \n end: ${endDate.toISOString()} `);
      filters.date.start = startDate.valueOf();
      filters.date.end = endDate.valueOf();
    } else {
      filters.date.start = null;
      filters.date.end = null;
    }

    // send new data request only if filters have changed
    if (JSON.stringify(filters) == JSON.stringify(prevFilters)) return;

    // send request

    refreshStatus = { status: "refreshing" };
    const res = await fetch("?/refresh", {
      method: "POST",
      body: JSON.stringify(filters),
    });

    // parse response
    const response = deserialize(await res.text());
    if (response.type === "success") {
      refreshStatus = { status: "idle" };
      songs = response.data!.songs as typeof songs;
      prevFilters = { ...filters };
      prevFilters.date = { ...filters.date };
      // generate new square arrangement
      if (songs) {
        squares = makeSquares(songs.length);
      } else {
        refreshStatus = { status: "error", error: "No songs found" };
        songs = [];
      }
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
      songs = [];
    }
  }

  // generate initial square arrangement
  $: squares = makeSquares(songs.length);

  onMount(refresh);
</script>

<div id="container">
  <div id="open-menu-header" class={filterVisibility ? "hidden" : ""}>
    <button on:click={() => {filterVisibility = true}}
      disabled={filterVisibility}
      id="open-menu" class="art-display-menu-button"
      >menu</button
    >
  </div>
  <div id="filters" class={!filterVisibility ? "hidden" : ""}>
    <div class="input-section">
      <div id="close-menu-header">
        <h1>Filters</h1>
        <button
          on:click={() => {filterVisibility = false;}}
          id="close-menu"
          class="art-display-menu-button">close</button
        >
      </div>

      <h2>basic information</h2>
      <div class="labeled-input">
        <label for="music-type">music type</label>
        <select
          id="music-type"
          bind:value={filters.aggregate}
          on:change={refresh}
        >
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
      {#if timeFrame == "custom"}
          <div class="labeled-input" aria-label="custom-date">
            <label for="start-date">start date</label>
            <input
              id="start-date"
              type="date"
              name="start-date"
              bind:value={dateStrings.start}
              on:blur={refresh}
            />
          </div>
          <div class="labeled-input" aria-label="custom-date">
            <label for="end-date">end date</label>
            <input
              id="end-date"
              type="date"
              name="end-date"
              bind:value={dateStrings.end}
              on:blur={refresh}
            />
          </div>
      {/if}
    </div>
    <div class="input-section">
      <h2>display size</h2>
      <div class="labeled-input">
        <label for="num-cells">number of cells</label>
        <input
          id="num-cells"
          type="number"
          name="num-cells"
          bind:value={filters.num_cells}
          on:blur={refresh}
          placeholder="max"
        />
      </div>
      <div class="labeled-input">
        <label for="rank-determinant">rank determinant</label>
        <select
          id="rank-determinant"
          bind:value={filters.rank_determinant}
          on:change={refresh}
        >
          <option value="listens">listens</option>
          <option value="time">time</option>
        </select>
      </div>
    </div>
    <div id="lower-btns">
      <button
        on:click={() => (squares = makeSquares(songs.length))}
        id="regenerate"
        class="art-display-button">Regenerate</button
      >
      <button on:click={captureDiv} class="art-display-button">Export</button>
    </div>
  </div>
  <div
    id="display-container"
    bind:clientWidth={displayContainerSize.width}
    bind:clientHeight={displayContainerSize.height}
  >
    {#if squares.length == 0 && refreshStatus.status == "idle"}
      <div
        id="placeholder-display"
        bind:this={artDisplayRef}
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
        bind:this={artDisplayRef}
        class="capture-area"
        style="{`width: ${displaySize}px; height: ${displaySize}px`}"
      >
        {#each squares as square, i}
          <Square {square} song={songs[i].song} />
        {/each}
      </div>
    {:else if refreshStatus.status == "refreshing"}
      <div
        id="placeholder-display"
        bind:this={artDisplayRef}
        class="capture-area"
      >
        <h1>Loading...</h1>
      </div>
    {:else}
      <div
        id="placeholder-display"
        bind:this={artDisplayRef}
        class="capture-area"
      >
        <h1>Error!</h1>
        <p>{refreshStatus.error}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .hidden {
    display: none !important;
  }

  #close-menu-header {
    max-width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #open-menu-header {
    position: absolute;
    top: 0;
    left: 0;
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
    position: relative;
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
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #display {
    aspect-ratio: 1 / 1;
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

  select,
  input[type="number"],
  input[type="date"] {
    background-color: var(--background);
    border: 0;
    border-bottom: 2px solid var(--medium);
    font-family: "Archivo", sans-serif;
    font-size: 15px;
    padding: 0 2px; /* compensate for border */
    color: var(--text);
  }
  /* make the colors the same!!*/
  input[type="date"]::-webkit-calendar-picker-indicator {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%23bbbbbb" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
  }

  select {
    width: 100px;
  }

  input[type="number"] {
    width: 60px;
  }

  select:hover,
  select:focus,
  input:hover,
  input:focus {
    outline: none;
    background-color: var(--midground);
  }
</style>
