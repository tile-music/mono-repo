<script lang="ts">
  import {
    listeningDataFilter,
    order,
    sortArray,
    filterColumnList,
  } from "./filters.svelte";
  import type {
    ListeningColumn,
    ListeningColumnKeys,
    ListeningDataRequest,
    TitleColumn,
  } from "../../../../../lib/Request";
  import ColumnSelection from "./ColumnSelection.svelte";
  import filterIcon from "$lib/assets/icons/filter.svg";
  import { derived } from "svelte/store";
  let { refresh }: { refresh: () => void } = $props();
  let datePickerVisibile = $state(false);
  $inspect(`filterColumnList: ${filterColumnList}`);
  const toggleDatePicker = () => (datePickerVisibile = !datePickerVisibile);
  const sortArrows = $derived((key: ListeningColumnKeys) => {
    if (listeningDataFilter[key]) {
      //if(localFilters[currentSortColumn]) localFilters[currentSortColumn].order = ""
      if (listeningDataFilter[key].order == "asc") {
        return "▲";
      } else if (listeningDataFilter[key].order == "desc") {
        return "▼";
      } else {
        return "";
      }
    } else if (listeningDataFilter === undefined)
      throw new Error(`FATAL: ${key} did not exist in filters`);
  });

  function updateFilters(sortAction: ListeningColumnKeys) {
    let columns: ListeningColumnKeys[] = Object.keys(
      listeningDataFilter,
    ) as ListeningColumnKeys[];
    for (let column of columns) {
      if (column != sortAction) {
        if (listeningDataFilter[column]) listeningDataFilter[column].order = "";
      }
    }
    if (listeningDataFilter[sortAction]) {
      listeningDataFilter[sortAction].order =
        listeningDataFilter[sortAction].order == "asc" ? "desc" : "asc";
    } else {
      throw new Error(`FATAL: ${sortAction} not found in localFilters`);
    }
    refresh();
  }
</script>

<div id="filters">
  <ColumnSelection {refresh}></ColumnSelection>
</div>
<div id="headers">
  <button id="art"><h2>art</h2></button>
  {#each filterColumnList() as column}
    <button class={column} onclick={() => updateFilters(column)}
      ><h2>{column}{sortArrows(column).replaceAll("_", " ")}</h2></button
    >
  {/each}
</div>

<style>
  @import "./styles.css";
  #filters {
    left: 0;
    width: 100%;
    z-index: 1;
    position: sticky;
    display: inline-block;
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

  button {
    all: unset;
  }
</style>
