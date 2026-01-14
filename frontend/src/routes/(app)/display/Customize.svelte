<script lang="ts">
    import { getDisplayState } from "./displayState";
    import type { DisplayDataRequest } from "$shared/Request";
    import type { AggregatedSongs } from "./arrangement";
    import { getArrangement, arr_types } from "./arrangement";

    const arrangement = getArrangement();
    const displayState = getDisplayState();
    const filters = $derived(displayState.filters);
    const context = $derived(displayState.context);
    const options = $derived(displayState.options);

    import Export from "./Export.svelte";
    import type { Profile } from "$shared/Profile";

    let {
        refresh,
        songs,
        profile,
    }: {
        refresh: (f: DisplayDataRequest) => void;
        songs: AggregatedSongs;
        profile: Profile | null;
    } = $props();

    // store local copy of filters to compare when changed
    const localFilters: DisplayDataRequest = $state({ ...filters });

    // handles hide/show functionality
    let hidden = $state(false);

    // needed for correct focus when incrementing max cells
    let numCells = $state<HTMLInputElement>();

    function updateFilters() {
        // set date range
        const startDate = new Date();
        const endDate = new Date();

        // wipe dateStrings if needed
        if (context.timeFrame != "custom") {
            context.dateStrings.start = null;
            context.dateStrings.end = null;
        }

        // make sure dateStrings sare null if no date is entered
        if (context.dateStrings.start == "") context.dateStrings.start = null;
        if (context.dateStrings.end == "") context.dateStrings.end = null;

        // translate chosen time frame to timestamps
        if (context.timeFrame != "all-time") {
            switch (context.timeFrame) {
                case "this-week":
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case "this-month":
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case "year-to-date":
                    startDate.setFullYear(endDate.getFullYear(), 0, 1);
                    break;
                case "this-year":
                    startDate.setMonth(endDate.getMonth() - 12);
                    break;
                case "custom":
                    // if neither date is a valid date, panic
                    if (
                        !(context.dateStrings.start?.split("-").length == 3) &&
                        !(context.dateStrings.end?.split("-").length == 3)
                    )
                        return;

                    startDate.setTime(0);

                    // translate value from date picker to timestamps
                    context.dateStrings.start
                        ? startDate.setTime(
                              new Date(context.dateStrings.start).valueOf(),
                          )
                        : null;
                    context.dateStrings.end
                        ? endDate.setTime(
                              new Date(context.dateStrings.end).valueOf(),
                          )
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
        // console.log("Filters: " + JSON.stringify(filters) + "\n Local: " + JSON.stringify(localFilters))
        if (JSON.stringify(filters) != JSON.stringify(localFilters))
            refresh(localFilters);
    }
</script>

{#if hidden}
    <div id="open-menu-header">
        <button
            onclick={() => {
                hidden = false;
            }}
            id="open-menu"
            class="art-display-menu-button">customize</button
        >
    </div>
{:else}
    <div id="customize">
        <div id="close-menu-header">
            <h1>customize</h1>
            <button
                onclick={() => {
                    hidden = true;
                }}
                id="close-menu"
                class="art-display-menu-button">close</button
            >
        </div>
        <div id="options">
            <div class="input-section">
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
                    <select
                        id="time-frame"
                        bind:value={context.timeFrame}
                        onchange={updateFilters}
                    >
                        <option value="this-week">this week</option>
                        <option value="this-month">this month</option>
                        <option value="year-to-date">year to date</option>
                        <option value="this-year">this year</option>
                        <option value="all-time">all time</option>
                        <option value="custom">custom</option>
                    </select>
                </div>
                {#if context.timeFrame == "custom"}
                    <div class="labeled-input" aria-label="custom-date">
                        <label for="start-date">start date</label>
                        <input
                            id="start-date"
                            type="date"
                            name="start-date"
                            bind:value={context.dateStrings.start}
                            onblur={updateFilters}
                        />
                    </div>
                    <div class="labeled-input" aria-label="custom-date">
                        <label for="end-date">end date</label>
                        <input
                            id="end-date"
                            type="date"
                            name="end-date"
                            bind:value={context.dateStrings.end}
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
                        min="1"
                        bind:value={localFilters.num_cells}
                        bind:this={numCells}
                        onchange={() => numCells?.focus()}
                        onblur={updateFilters}
                        placeholder="max"
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
                    <label for="show-cell-info">include cell info</label>
                    <select
                        id="show-cell-info"
                        bind:value={options.showCellInfo}
                    >
                        <option value="always">always</option>
                        <option value="on-hover">on hover</option>
                        <option value="never">never</option>
                    </select>
                </div>
            </div>
            <div class="input-section">
                <h2>header options</h2>
                <div class="labeled-input">
                    <label for="show-header">show header</label>
                    <input
                        type="checkbox"
                        id="show-header"
                        bind:checked={options.header.showHeader}
                    />
                </div>
                <div class="labeled-input">
                    <label for="name-source">name source</label>
                    <select
                        id="name-source"
                        bind:value={options.header.nameSource}
                    >
                        <option value="name">full name</option>
                        <option value="username">username</option>
                    </select>
                </div>
                <div class="labeled-input">
                    <label for="show-avatar">show avatar</label>
                    <input
                        type="checkbox"
                        id="show-avatar"
                        bind:checked={options.header.showAvatar}
                    />
                </div>
            </div>
            <div class="input-section">
                <h2>arrangement options</h2>
                <div class="labeled-input">
                    <label for="arr-type">arrangement type</label>
                    <select
                        name="arr-type"
                        id="arr-type"
                        bind:value={arrangement.type}
                        onchange={() => arrangement.change(arrangement, songs)}
                    >
                        {#each Object.keys(arr_types) as arr_type}
                            <option value={arr_type}
                                >{arr_type.replaceAll("_", " ")}</option
                            >
                        {/each}
                    </select>
                </div>
                {#each Object.entries(arrangement.options) as [name, option]}
                    <div class="labeled-input">
                        <label for={name}>{option.label}</label>
                        {#if option.type == "number"}
                            <input
                                type="number"
                                {name}
                                id={name}
                                min={option.min || null}
                                max={option.max || null}
                                step={option.step || null}
                                bind:value={arrangement.state[name]}
                                onchange={() =>
                                    arrangement.generate(arrangement, songs)}
                            />
                        {:else if option.type == "checkbox"}
                            <input
                                type="checkbox"
                                {name}
                                id={name}
                                bind:checked={
                                    arrangement.state[name] as boolean
                                }
                                onchange={() =>
                                    arrangement.generate(arrangement, songs)}
                            />
                        {:else if option.type == "select"}
                            <select
                                id={name}
                                bind:value={arrangement.state[name]}
                                onchange={() =>
                                    arrangement.generate(arrangement, songs)}
                            >
                                {#each option.values as value}
                                    <option {value}>{value}</option>
                                {/each}
                            </select>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        <div id="lower-btns">
            <button
                onclick={() => arrangement.generate(arrangement, songs)}
                id="regenerate"
                class="art-display-button">regenerate</button
            >
            <Export {songs} {profile} />
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

    #customize {
        width: 30%;
        min-width: 300px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    #options {
        display: flex;
        flex-direction: column;
        gap: 30px;
        overflow: auto;
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
        padding: 2px; /* compensate for border */
        color: var(--text);
    }

    select {
        width: 100px;
        -webkit-appearance: none;
        appearance: none;
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
