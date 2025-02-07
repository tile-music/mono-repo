// IMPORTS
import { Cluster } from "./(arrangements)/Cluster";
import { Grid } from './(arrangements)/Grid';
import { filters } from "./filters.svelte";

// STATE
export let arrangement: {
    type: typeof arr_types[number],
    options: ArrangementOptions,
    state: Record<string, boolean | number | string>,
    squares: SquareInfo[],
    change: () => void,
    generate: () => void
} = $state({
    type: "cluster",
    options: {...Cluster.options},
    state: {...Cluster.state},
    squares: [],
    change, generate
});

// TYPES AND FUNCTIONS
const arr_types = ["grid", "cluster"] as const;

/**
 * Represents the properties of an individual square,
 * including the x and y position of its top left corner,
 * scale, and an optional rotation.
 * 
 * All values are from 0 to 1 relative to the top left
 * corner of a square container, except rotation, which
 * is represented in degrees
 */
export type SquareInfo = {
    x: number;          // top left corner x position, 0 to 1
    y: number;          // top left corner y position, 0 to 1
    size: number;       // square size, 0 to 1
    rotation?: number;  // optional square rotation, in degrees
};

/**
 * Represents the options an arrangement can have, which will
 * be rendered as input elements in the frontend. Includes
 * number, checkbox, and select inputs.
 */
type ArrangementOptions = Record<string, {
    type: "number";
    label: string;
    min?: number;
    max?: number;
} | {
    type: "checkbox";
    label: string;
} | {
    type: "select";
    label: string;
    values: readonly string[];
}>

/**
 * Represents the state of an arrangement's options. Maps
 * each option into a key value pair, with number inputs
 * having number types, checkbox inputs having boolean types,
 * and select inputs having string union types. Instantiate
 * using the intended default values for each option.
 */
export type ArrangementState<T extends ArrangementOptions> = {
    [P in keyof T]: [T[P]] extends [{ type: "number" }] ? number :
        [T[P]] extends [{ type: "checkbox" }] ? boolean :
        [T[P]] extends [{ type: "select" }] ? T[P]["values"][number] : never
};

type Generate<Options extends ArrangementOptions> =
    (n_s: number | null, s: ArrangementState<Options>) => SquareInfo[];

export type Arrangement<Options extends ArrangementOptions> = {
    options: Options;
    state: ArrangementState<Options>;
    generate: Generate<Options>;
}

function change() {
    switch (arrangement.type) {
        case "grid":
            arrangement.options = {...Grid.options}
            arrangement.state = {...Grid.state}
            break;
        case "cluster":
            arrangement.options = {...Cluster.options}
            arrangement.state = {...Cluster.state}
            break;
    }
    generate()
}

function generate() {
    if (arrangement.type == "grid")
        arrangement.squares = Grid.generate(filters.num_cells, arrangement.state as typeof Grid.state);
    else
        arrangement.squares = Cluster.generate(filters.num_cells, arrangement.state as typeof Cluster.state);
}