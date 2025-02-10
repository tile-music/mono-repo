<script lang="ts">
  import { listeningDataFilter } from "./filters.svelte.js";
  import type { ListeningColumnKeys } from "../../../../../lib/Request";
  const { refresh }: { refresh: () => void } = $props();
  let showSelection = $state<boolean>(false);
  let selections = $derived<ListeningColumnKeys[]>(
    Object.keys(listeningDataFilter) as ListeningColumnKeys[],
  );
</script>

<div class="dropdown">
  <button class="filter" onclick={() => (showSelection = !showSelection)}
    >columns</button
  >
  <div id="column-selection">
    {#if showSelection}
      {#each selections as filter}
        <input
          type="checkbox"
          id={filter}
          bind:checked={listeningDataFilter[filter].checked}
          onchange={() => refresh()}
        />{filter.replace(`_`, " ")}
      {/each}
    {/if}
  </div>
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }
  #column_selections {
    display: none;
    position: absolute;
    background-color: white;
    min-width: 160px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1;
    border-radius: 5px;
    overflow: hidden;
  }
  button {
    background-color: var(--background);
    border: 0;
    border-bottom: 2px solid var(--medium);
    font-family: "Archivo", sans-serif;
    font-size: 15px;
    padding: 0 2px; /* compensate for border */
    color: var(--text);
  }
</style>
