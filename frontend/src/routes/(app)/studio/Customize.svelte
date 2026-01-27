<script lang="ts">
    import { getDisplayState } from "./displayState";
    import type { DisplayDataRequest } from "$shared/Request";
    import type { AggregatedSongs } from "./arrangement";
    import { getArrangement, arr_types } from "./arrangement";
    import { Button, Field, Select, Input } from "$lib/ui";
    import { Export as ExportIcon, Refresh, Settings } from "$lib/icons";

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
    const localFilters: DisplayDataRequest = $derived(
        structuredClone($state.snapshot(filters)),
    );

    // store export status
    let exportStatus: "idle" | "configuring" | "exporting" | "error" | "done" =
        $state("idle");

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

<div id="open-menu-header" class:visible={hidden}>
    <button
        id="refresh"
        aria-label="Regenerate arrangement"
        onclick={() => {
            arrangement.generate(arrangement, songs);
        }}
    >
        <Refresh />
    </button>
    <button
        onclick={() => {
            hidden = false;
        }}
        id="open"
        aria-label="Open customize menu"
    >
        <Settings />
    </button>
    <button
        onclick={() => {
            exportStatus = "configuring";
        }}
        id="export"
        aria-label="Export arrangement"
    >
        <ExportIcon />
    </button>
</div>
<div id="customize" class:visible={!hidden}>
    <div id="close-menu-header">
        <h1>Customize</h1>
        <Button
            onclick={() => {
                hidden = true;
            }}
            id="close-menu"
        >
            Close
        </Button>
    </div>
    <div id="options">
        <div class="input-section">
            <h2>Basic information</h2>
            <Field row>
                <label for="music-type">Music type</label>
                <Select
                    variant="inline"
                    id="music-type"
                    bind:value={localFilters.aggregate}
                    onchange={updateFilters}
                >
                    <option value="song">Song</option>
                    <option value="album">Album</option>
                </Select>
            </Field>
            <Field row>
                <label for="time-frame">Time frame</label>
                <Select
                    variant="inline"
                    id="time-frame"
                    bind:value={context.timeFrame}
                    onchange={updateFilters}
                >
                    <option value="this-week">This week</option>
                    <option value="this-month">This month</option>
                    <option value="year-to-date">Year to date</option>
                    <option value="this-year">This year</option>
                    <option value="all-time">All time</option>
                    <option value="custom">Custom</option>
                </Select>
            </Field>
            {#if context.timeFrame == "custom"}
                <Field row>
                    <label for="start-date">Start date</label>
                    <Input
                        variant="inline"
                        id="start-date"
                        type="date"
                        name="start-date"
                        bind:value={context.dateStrings.start}
                        onblur={updateFilters}
                    />
                </Field>
                <Field row>
                    <label for="end-date">End date</label>
                    <Input
                        variant="inline"
                        id="end-date"
                        type="date"
                        name="end-date"
                        bind:value={context.dateStrings.end}
                        onblur={updateFilters}
                    />
                </Field>
            {/if}
        </div>
        <div class="input-section">
            <h2>Display size</h2>
            <Field row>
                <label for="num-cells">Number of cells</label>
                <Input
                    variant="inline"
                    id="num-cells"
                    type="number"
                    name="num-cells"
                    min="1"
                    bind:value={localFilters.num_cells}
                    bind:input={numCells}
                    onchange={() => numCells?.focus()}
                    onblur={updateFilters}
                    placeholder="max"
                />
            </Field>
            <Field row>
                <label for="rank-determinant">Rank determinant</label>
                <Select
                    variant="inline"
                    id="rank-determinant"
                    bind:value={localFilters.rank_determinant}
                    onchange={updateFilters}
                >
                    <option value="listens">Listens</option>
                    <option value="time">Time</option>
                </Select>
            </Field>
        </div>
        <div class="input-section">
            <h2>Display style</h2>
            <Field row>
                <label for="show-cell-info">Include cell info</label>
                <Select
                    variant="inline"
                    id="show-cell-info"
                    bind:value={options.showCellInfo}
                >
                    <option value="always">Always</option>
                    <option value="on-hover">On hover</option>
                    <option value="never">Never</option>
                </Select>
            </Field>
        </div>
        <div class="input-section">
            <h2>Header options</h2>
            <Field row>
                <label for="show-header">Show header</label>
                <Input
                    variant="inline"
                    type="checkbox"
                    id="show-header"
                    bind:checked={options.header.showHeader}
                />
            </Field>
            <Field row>
                <label for="name-source">Name source</label>
                <Select
                    variant="inline"
                    id="name-source"
                    bind:value={options.header.nameSource}
                >
                    <option value="name">Full name</option>
                    <option value="username">Username</option>
                </Select>
            </Field>
            <Field row>
                <label for="show-avatar">Show avatar</label>
                <Input
                    variant="inline"
                    type="checkbox"
                    id="show-avatar"
                    bind:checked={options.header.showAvatar}
                />
            </Field>
        </div>
        <div class="input-section">
            <h2>Arrangement options</h2>
            <Field row>
                <label for="arr-type">Arrangement type</label>
                <Select
                    variant="inline"
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
                </Select>
            </Field>
            {#each Object.entries(arrangement.options) as [name, option]}
                <Field row>
                    <label for={name}>{option.label}</label>
                    {#if option.type == "number"}
                        <Input
                            variant="inline"
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
                        <Input
                            variant="inline"
                            type="checkbox"
                            {name}
                            id={name}
                            bind:checked={arrangement.state[name] as boolean}
                            onchange={() =>
                                arrangement.generate(arrangement, songs)}
                        />
                    {:else if option.type == "select"}
                        <Select
                            variant="inline"
                            id={name}
                            bind:value={arrangement.state[name]}
                            onchange={() =>
                                arrangement.generate(arrangement, songs)}
                        >
                            {#each option.values as value}
                                <option {value}>{value}</option>
                            {/each}
                        </Select>
                    {/if}
                </Field>
            {/each}
        </div>
    </div>
    <div id="lower-btns">
        <Button
            onclick={() => arrangement.generate(arrangement, songs)}
            id="regenerate"
            class="art-display-button"
        >
            Regenerate
        </Button>
        <Button
            onclick={() => (exportStatus = "configuring")}
            id="regenerate"
            class="art-display-button"
        >
            Export
        </Button>
    </div>
</div>
<Export {songs} {profile} bind:status={exportStatus} />

<style>
    h1,
    h2 {
        margin: 0;
    }

    #lower-btns {
        display: flex;
        gap: 20px;
        margin-top: auto;
    }

    #close-menu-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #open-menu-header {
        display: none;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;

        &.visible {
            display: flex;
        }

        & > * {
            border-radius: 5px;
            border: 1px solid;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            color: var(--fg);
        }

        #refresh,
        #export {
            border-color: var(--border);
            background-color: var(--bg-subtle);
        }

        #open {
            border-color: var(--accent);
            background-color: var(--accent-subtle);
        }

        @media (max-width: 700px) {
            position: absolute;
            bottom: 2rem;
            flex-direction: row;
            width: 100%;
            height: fit-content;
            z-index: 3;
        }
    }

    #customize {
        height: 100%;
        display: none;
        flex-direction: column;
        gap: 1rem;
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        border-radius: 5px;
        padding: 1rem;

        &.visible {
            display: flex;

            @media (max-width: 700px) {
                position: absolute;
                inset: 0;
                z-index: 3;
            }
        }
    }

    #options {
        display: flex;
        flex-direction: column;
        gap: 30px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 1rem;
    }

    .input-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 20em;
    }

    label {
        width: 10em;
        flex-shrink: 0;
    }
</style>
