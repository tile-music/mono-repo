<script lang="ts">
  import { listeningColumns } from "./filters.svelte";
  import type { ListeningColumn, ListeningDataRequest, TitleColumn } from "../../../../../lib/Request";
  import filterIcon from "$lib/assets/icons/filter.svg";
  let { refresh }: { refresh: (filters: ListeningDataRequest) => void } =
    $props();
  const localFilters: ListeningDataRequest = $state({ ...listeningColumns });
  let datePickerVisibile = $state(false);
  const toggleDatePicker = () => (datePickerVisibile = !datePickerVisibile);
  function updateFilters(sortAction: string) {
    switch (sortAction) {
      case "songs":
        const col: ListeningColumn<TitleColumn> | null = listeningColumns.songs;
        
        break;
      default:
        filtersListening.songs.sort = "";
        break;
    }
    refresh({
      ...filtersListening,
    });
  }
</script>

<div id="filters">
  <button class="filter">title</button>

  <button class="filter">artist</button>
  <button class="filter">album</button>
  <button class="filter">album</button>
  <button class="filter">duration</button>
  <button class="filter">plays</button>
  <button class="filter">date range</button>
  <button class="filter" id="column_selections">columns</button>
</div>
<div id="headers">
  <button id="art"><h2>art</h2></button>
  <button id="title" onclick={() => updateFilters("songs")}
    ><h2>title</h2></button
  >
  <button id="artist" onclick={() => updateFilters("artists")}
    ><h2>artist</h2></button
  >
  <button id="album" onclick={() => updateFilters("title")}>
    <h2>album</h2></button
  >
  <button id="duration" onclick={() => updateFilters("durations")}>
    <h2>duration</h2></button
  >
  <button id="plays" onclick={() => updateFilters("plays")}
    ><h2>plays</h2></button
  >
  <button id="listened_at" onclick={() => updateFilters("listened_ats")}
    ><h2>listened at</h2></button
  >
</div>

<style>
  svg {
    color: var(--text);
  }
  #filters {
    left: 0;
    width: 100%;
    z-index: 1;
    position: sticky;
  }
  .filter {
    background-color: var(--background);
    border: 0;
    border-bottom: 2px solid var(--medium);
    font-family: "Archivo", sans-serif;
    font-size: 15px;
    padding: 0 2px; /* compensate for border */
    color: var(--text);
  }
  #column_selections {
    position: absolute;
    right: 0;
    margin-right: 10px;
  }

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
</style>
