<script lang="ts">
    import { listeningDataFilter, filterColumnList } from "./filters.svelte";
    import type { ListeningColumnKeys } from "$shared/Request";
    import ColumnSelection from "./ColumnSelection.svelte";
    let {
        loadData,
    }: {
        loadData: (refresh: boolean) => void;
    } = $props();

    // $inspect(`filterColumnList: ${filterColumnList}`);

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

    /**
     * Updates the sorting order of the specified column in the listening data filter.
     *
     * @param {ListeningColumnKeys} sortAction - The key of the column to update the sorting order for.
     *
     * This function iterates through all columns in the listening data filter and resets their sorting order
     * if they are not the specified column (`sortAction`). If the specified column exists in the filter,
     * its sorting order is toggled between "asc" (ascending) and "desc" (descending). If the column does not
     * exist in the filter, an error is thrown.
     *
     * After updating the sorting order, the `loadData` function is called with `true` to reload the data.
     *
     * @throws {Error} If the specified column (`sortAction`) is not found in the listening data filter.
     */
    function updateFilters(sortAction: ListeningColumnKeys) {
        let columns: ListeningColumnKeys[] = Object.keys(
            listeningDataFilter,
        ) as ListeningColumnKeys[];
        for (let column of columns) {
            if (column != sortAction) {
                if (listeningDataFilter[column])
                    listeningDataFilter[column].order = "";
            }
        }
        if (listeningDataFilter[sortAction]) {
            listeningDataFilter[sortAction].order =
                listeningDataFilter[sortAction].order == "asc" ? "desc" : "asc";
        } else {
            throw new Error(`FATAL: ${sortAction} not found in localFilters`);
        }
        loadData(true);
    }
</script>

<div id="filters">
    <ColumnSelection {loadData}></ColumnSelection>
</div>
<div id="headers">
    <button id="art"><h2>art</h2></button>
    {#each filterColumnList() as column}
        <button class={column} onclick={() => updateFilters(column)}
            ><h2>{column.replaceAll("_", " ")}{sortArrows(column)}</h2></button
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
