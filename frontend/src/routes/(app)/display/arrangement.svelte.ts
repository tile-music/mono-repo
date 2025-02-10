// IMPORTS
import { Cluster } from "./(arrangements)/Cluster";
import { Grid } from './(arrangements)/Grid';
import { GridCluster } from './(arrangements)/GridCluster'
import { filters } from "./filters.svelte";

// 
export const arr_types = {
    grid: Grid,
    cluster: Cluster,
    grid_cluster: GridCluster
} as const;

// STATE
export let arrangement: {
    type: keyof typeof arr_types,
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
    step?: number;
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

/**
 * A generator function capable of taking in an
 * arrangement's options, in addition to a max number of squares,
 * and outputting a list of square positions, sizes, and optional
 * rotations.
 */
type Generate<Options extends ArrangementOptions> =
    (n_s: number | null, s: ArrangementState<Options>) => SquareInfo[];

/**
 * A full arrangement, complete with options and their default values
 * as well as a generator function.
 */
export type Arrangement<Options extends ArrangementOptions> = {
    options: Options;
    state: ArrangementState<Options>;
    generate: Generate<Options>;
}

/**
 * Swaps the current arrangement, regenerating options
 */
function change() {
    arrangement.options = { ...arr_types[arrangement.type].options }
    arrangement.state = { ...arr_types[arrangement.type].state }
    generate()
}

/**
 * Generates a square arrangement using the current generator
 * and options.
 */
function generate() {
    // super type unsafe, but i simply cannot figure out another way
    const type = arr_types[arrangement.type] as unknown as Arrangement<{}>;
    arrangement.squares = type.generate(filters.num_cells, arrangement.state);
}