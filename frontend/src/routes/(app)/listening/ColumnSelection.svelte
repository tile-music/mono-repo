<script lang="ts">
    import { listeningDataFilter } from "./filters.svelte.js";
    import type { ListeningColumnKeys } from "$shared/Request";
    const { loadData }: { loadData: (refresh: boolean) => void } = $props();
    let showSelection = $state<boolean>(false);
    let selections = $derived<ListeningColumnKeys[]>(
        Object.keys(listeningDataFilter) as ListeningColumnKeys[],
    );
</script>

<div class="dropdown">
    <button class="filter" onclick={() => (showSelection = !showSelection)}
        >columns</button
    >
    <div id="column-selection" class:show={showSelection}>
        {#if showSelection}
            <ul>
                {#each selections as filter}
                    <li>
                        <input
                            type="checkbox"
                            id={filter}
                            bind:checked={listeningDataFilter[filter].checked}
                            onchange={() => loadData(true)}
                        />{filter.replaceAll(`_`, " ")}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

<style>
    .dropdown {
        position: relative;
        display: inline-block;
    }

    #column-selection {
        position: absolute;
        background-color: var(--background);
        min-width: 160px;
        border-radius: 5px;
        overflow: hidden;
        z-index: 1;
        display: block;
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
