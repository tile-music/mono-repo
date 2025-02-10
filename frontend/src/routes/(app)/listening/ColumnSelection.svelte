<script lang="ts">
  import {listeningDataFilter} from "./filters.svelte.js"
  import type {ListeningColumnKeys} from "../../../../../lib/Request" 
  const { refresh }: { refresh: () => void } = $props();
  let showSelection = $state<boolean>(false)
  let selections = $derived<ListeningColumnKeys[]>(Object.keys(listeningDataFilter) as ListeningColumnKeys[]);

</script>

<button class="filter" id="column_selections" onclick={()=> showSelection = !showSelection}>columns</button>
<div id="column-selection">
  {#if showSelection}
    {#each selections as filter}
      <input type=checkbox id={filter} bind:checked={listeningDataFilter[filter].checked} onchange={() => refresh()}/>{filter.replace(`_`, " ") }
    {/each}
  {/if}
</div>
