<script lang="ts">
  import { filters, filtersListening } from "./filters.svelte";
  import type { ListeningDataRequest } from "../../../../../lib/Request";
  import { derived } from "svelte/store";
  import {clickOutside} from "../../../lib/clickOutside";
  let { refresh }: { refresh: (filters: ListeningDataRequest) => void } =
    $props();
  const localFilters: ListeningDataRequest = $state({ ...filters });
  let datePickerVisibile = $state(false);
  const toggleDatePicker = () => datePickerVisibile = !datePickerVisibile;
  function updateFilters() {
    const startDate = new Date();
    const endDate = new Date();

    /* 
    // might need to implement something similar here
    if (filters.timeFrame != "custom") {
      filtersListening.dateStrings.start = null;
      filtersListening.dateStrings.end = null;
    } */

    if (filtersListening.dateStrings.start == "") filters.date.start = null;
    if (filtersListening.dateStrings.end == "") filters.date.end = null;

    refresh({
      ...filters,
      start: startDate.valueOf(),
      end: endDate.valueOf(),
    });
    
  }
</script>

<div id="headers">
  <h2 id="art">art</h2>
  <h2 id="title">title</h2>
  <h2 id="artist">artist</h2>
  <h2 id="album">album</h2>
  <h2 id="duration">duration</h2>
  <h2 id="plays">plays</h2>
  <div id="date">
    <button><h2 id="listened_at">listened at</h2></button>
    <button id="date-filter" onclick={toggleDatePicker}>filter</button>

  </div>
  {#if datePickerVisibile}
    <div id="date-picker" use:clickOutside on:clickOutside={toggleDatePicker}>
      <input type="date" onblur={updateFilters} bind:value={filtersListening.dateStrings.start} />
      <input type="date" onblur={updateFilters} bind:value={filtersListening.dateStrings.end} />
    </div>
  {/if}
</div>

<style>
  #headers {
    display: flex;
    gap: 10px;
    padding: 1em 0 1em 60px;
    width: fit-content;
    flex-direction: row;
  }

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
  #listened_at {
    width: 200px;
  }

  #duration,
  #plays {
    width: 100px;
  }
  button {
    all: unset;
  }
  #date-picker {
    z-index: 2;
    position: absolute;

    background: var(--background);
    padding: 10px;
  }
</style>
