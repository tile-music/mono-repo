<script lang="ts">
  import { listeningColumns } from "./filters.svelte";
  import type { ListeningColumn, ListeningColumnKeys, ListeningDataRequest, TitleColumn } from "../../../../../lib/Request";
  import filterIcon from "$lib/assets/icons/filter.svg";
  import { derived } from "svelte/store";
  let { refresh }: { refresh: (filters: ListeningDataRequest) => void } =
    $props();
  const localFilters: ListeningDataRequest = $state({ ...listeningColumns });
  const filterColumnList = $derived.by(()=> {
    const keys : ListeningColumnKeys[] = Object.keys(localFilters) as ListeningColumnKeys[];
    return keys.filter(column => localFilters[column] !== null)
  });
  let datePickerVisibile = $state(false);
  $inspect(`filterColumnList: ${filterColumnList}`);
  const toggleDatePicker = () => (datePickerVisibile = !datePickerVisibile);
  let sortArrows = $derived((key : ListeningColumnKeys) =>  {
    if(localFilters[key]) {
      //if(localFilters[currentSortColumn]) localFilters[currentSortColumn].order = ""
      if(localFilters[key].order == "asc") {
        return "▲"
      } else if(localFilters[key].order == "desc") {
        return "▼"
      } else {
        return ""
      }
    } else throw new Error(`FATAL: ${key} not found in localFilters`)
  });

  function updateFilters(sortAction: ListeningColumnKeys) {
    let columns : ListeningColumnKeys[] = Object.keys(localFilters) as ListeningColumnKeys[]; 
      for(let column of columns) {
        if(column != sortAction) {
          if(localFilters[column])
          localFilters[column].order = ""
        }
      }
    if (localFilters[sortAction]) {
      localFilters[sortAction].order =
        localFilters[sortAction].order == "asc" ? "desc" : "asc";
    } else {
      throw new Error(`FATAL: ${sortAction} not found in localFilters`);
    }
    refresh({
      ...localFilters,
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
  <!-- <button id="art"><h2>art</h2></button>
  <button id="title" onclick={() => updateFilters("song")}
    ><h2>title{sortArrows("songs")}</h2></button
  >
  <button id="artist" onclick={() => updateFilters("artist")}
    ><h2>artist{sortArrows("artists")} </h2></button
  >
  <button id="album" onclick={() => updateFilters("album")}>
    <h2>album{sortArrows("albums")}</h2></button
  >
  <button id="duration" onclick={() => updateFilters("duration")}>
    <h2>duration {sortArrows("durations")}</h2></button
  >
  <button id="plays" onclick={() => updateFilters("listens  ")}
    ><h2>plays {sortArrows("listens")}</h2></button
  >
  <button id="listened_at" onclick={() => updateFilters("listened_ats")}
    ><h2>listened at {sortArrows("listened_ats")}</h2></button
  > -->
  {#each filterColumnList as column}
    <button id={column} on:click={() => updateFilters(column)}><h2>{column}{sortArrows(column)}</h2></button>
  {/each}
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


  #plays {
    width: 100px;
  }
  #duration {
    width: 125px
  }
  button {
    all: unset;
  }
</style>
