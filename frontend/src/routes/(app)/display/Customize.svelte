<script lang="ts">
  import { filters, filtersContext, generalOptions } from './filters.svelte';
  import type { DisplayDataRequest } from "../../../../../lib/Request";

  let { refresh, regenerateDisplay, exportDisplay }: {
    refresh: (f: DisplayDataRequest) => void,
    regenerateDisplay: () => void,
    exportDisplay: () => void
  } = $props();

  // store local copy of filters to compare when changed
  const localFilters: DisplayDataRequest = $state({...filters});

  // handles hide/show functionality
  let hidden = $state(false);

  function updateFilters() {
    // set date range
    const startDate = new Date('1970-01-01');
    const endDate = new Date();

    // wipe dateStrings if needed
    if (filtersContext.timeFrame != "custom") {
      filtersContext.dateStrings.start = null;
      filtersContext.dateStrings.end = null;
    }

    // make sure dateStrings sare null if no date is entered
    if (filtersContext.dateStrings.start == "") filtersContext.dateStrings.start = null;
    if (filtersContext.dateStrings.end == "") filtersContext.dateStrings.end = null;

    // translate chosen time frame to timestamps
    if (filtersContext.timeFrame != "all-time") {
      switch (filtersContext.timeFrame) {
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
          // if neither date is a valid date, panic
          if (
            !(filtersContext.dateStrings.start?.split("-").length == 3) &&
            !(filtersContext.dateStrings.end?.split("-").length == 3)
          ) return;

          // translate value from date picker to timestamps
          filtersContext.dateStrings.start
            ? startDate.setTime(new Date(filtersContext.dateStrings.start).valueOf())
            : null;
          filtersContext.dateStrings.end
            ? endDate.setTime(new Date(filtersContext.dateStrings.end).valueOf())
            : null;
          break;
        default:
          throw Error("invalid time frame selection");
      }
      localFilters.date.start = startDate.valueOf();
      localFilters.date.end = endDate.valueOf();
    } else {
      localFilters.date.start = null;
      localFilters.date.end = null;
    }

    // send new data request only if filters have changed
    if (JSON.stringify(filters) != JSON.stringify(localFilters))
      refresh(localFilters);
  }
</script>

{#if hidden}
  <div id="open-menu-header">
    <button onclick={() => {hidden = false}} id="open-menu"
    class="art-display-menu-button">customize</button>
  </div>
{:else}
  <div id="filters">
    <div class="input-section">
      <div id="close-menu-header">
        <h1>customize</h1>
        <button onclick={() => {hidden = true}} id="close-menu"
        class="art-display-menu-button">close</button>
      </div>

      <h2>basic information</h2>
      <div class="labeled-input">
        <label for="music-type">music type</label>
        <select
          id="music-type"
          bind:value={localFilters.aggregate}
          onchange={updateFilters}
        >
          <option value="song">song</option>
          <option value="album">album</option>
        </select>
      </div>
      <div class="labeled-input">
        <label for="time-frame">time frame</label>
        <select id="time-frame"
        bind:value={filtersContext.timeFrame}
        onchange={updateFilters}>
          <option value="this-week">this week</option>
          <option value="this-month">this month</option>
          <option value="year-to-date">year to date</option>
          <option value="this-year">this year</option>
          <option value="all-time">all time</option>
          <option value="custom">custom</option>
        </select>
      </div>
      {#if filtersContext.timeFrame == "custom"}
          <div class="labeled-input" aria-label="custom-date">
            <label for="start-date">start date</label>
            <input
              id="start-date"
              type="date"
              name="start-date"
              bind:value={filtersContext.dateStrings.start}
              onblur={updateFilters}
            />
          </div>
          <div class="labeled-input" aria-label="custom-date">
            <label for="end-date">end date</label>
            <input
              id="end-date"
              type="date"
              name="end-date"
              bind:value={filtersContext.dateStrings.end}
              onblur={updateFilters}
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
          bind:value={localFilters.num_cells}
          onblur={updateFilters}
          placeholder="max"
          min="1"
        />
      </div>
      <div class="labeled-input">
        <label for="rank-determinant">rank determinant</label>
        <select
          id="rank-determinant"
          bind:value={localFilters.rank_determinant}
          onchange={updateFilters}
        >
          <option value="listens">listens</option>
          <option value="time">time</option>
        </select>
      </div>
    </div>
    <div class="input-section">
      <h2>display style</h2>
      <div class="labeled-input">
        <label for="num-cells">include cell info</label>
        <select id="show-cell-info" bind:value={generalOptions.showCellInfo}>
          <option value="always">always</option>
          <option value="on-hover">on hover</option>
          <option value="never">never</option>
        </select>
      </div>
    </div>
    <div id="lower-btns">
      <button
        onclick={regenerateDisplay}
        id="regenerate"
        class="art-display-button">regenerate</button
      >
      <button onclick={exportDisplay} class="art-display-button">export</button>
    </div>
  </div>
{/if}

<style>
  #lower-btns {
    display: flex;
    gap: 20px;
    margin-top: auto;
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