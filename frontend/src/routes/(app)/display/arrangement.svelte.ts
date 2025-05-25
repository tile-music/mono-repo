// IMPORTS
import { Cluster } from "./(arrangements)/Cluster";
import { Grid } from "./(arrangements)/Grid";
import { GridCluster } from "./(arrangements)/GridCluster";
import type { SongInfo } from "$shared/Song";

// ARRANGEMENTS
export const arr_types = {
    grid: Grid,
    cluster: Cluster,
    grid_cluster: GridCluster,
} as const;

// STATE
export let arrangement: {
    type: keyof typeof arr_types;
    options: ArrangementOptions;
    state: Record<string, boolean | number | string>;
    squares: SquareInfo[];
    change: (songs: AggregatedSongs) => void;
    generate: (songs: AggregatedSongs) => void;
} = $state({
    type: "cluster",
    options: { ...Cluster.options },
    state: { ...Cluster.state },
    squares: [],
    change,
    generate,
});

export let songs: AggregatedSongs = $state([]);

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
    x: number; // top left corner x position, 0 to 1
    y: number; // top left corner y position, 0 to 1
    size: number; // square size, 0 to 1
    rotation?: number; // optional square rotation, in degrees
};

/**
 * Represents the options an arrangement can have, which will
 * be rendered as input elements in the frontend. Includes
 * number, checkbox, and select inputs.
 */
type ArrangementOptions = Record<
    string,
    | {
          type: "number";
          label: string;
          min?: number;
          max?: number;
          step?: number;
      }
    | {
          type: "checkbox";
          label: string;
      }
    | {
          type: "select";
          label: string;
          values: readonly string[];
      }
>;

/**
 * Represents the state of an arrangement's options. Maps
 * each option into a key value pair, with number inputs
 * having number types, checkbox inputs having boolean types,
 * and select inputs having string union types. Instantiate
 * using the intended default values for each option.
 */
export type ArrangementState<T extends ArrangementOptions> = {
    [P in keyof T]: [T[P]] extends [{ type: "number" }]
        ? number
        : [T[P]] extends [{ type: "checkbox" }]
          ? boolean
          : [T[P]] extends [{ type: "select" }]
            ? T[P]["values"][number]
            : never;
};

/**
 * Represents the songs being passed to the generator function.
 * Includes a list of song info objects, as well as the total
 * number of times each song appeared.
 */
export type AggregatedSongs = { song: SongInfo; quantity: number }[];

/**
 * A generator function capable of taking in an
 * arrangement's options, in addition to a max number of squares,
 * and outputting a list of square positions, sizes, and optional
 * rotations.
 */
type Generate<Options extends ArrangementOptions> = (
    songs: AggregatedSongs,
    s: ArrangementState<Options>,
) => SquareInfo[];

/**
 * A full arrangement, complete with options and their default values
 * as well as a generator function.
 */
export type Arrangement<Options extends ArrangementOptions> = {
    options: Options;
    state: ArrangementState<Options>;
    generate: Generate<Options>;
};

/**
 * Swaps the current arrangement, regenerating options
 */
function change(songs: AggregatedSongs) {
    arrangement.options = { ...arr_types[arrangement.type].options };
    arrangement.state = { ...arr_types[arrangement.type].state };
    generate(songs);
}

/**
 * Generates a square arrangement using the current generator
 * and options.
 */
function generate(songs: AggregatedSongs) {
    for (const key in arrangement.options) {
        const option = arrangement.options[key];
        if (option.type == "number") {
            if (typeof arrangement.state[key] == "number") {
                if (option.max)
                    arrangement.state[key] = Math.min(
                        arrangement.state[key],
                        option.max,
                    );
                if (option.min)
                    arrangement.state[key] = Math.max(
                        arrangement.state[key],
                        option.min,
                    );
            } else {
                const default_state = arr_types[arrangement.type].state;
                arrangement.state[key] =
                    default_state[key as keyof typeof default_state];
            }
        }
    }

    // super type unsafe, but i simply cannot figure out another way
    const type = arr_types[arrangement.type] as unknown as Arrangement<{}>;
    arrangement.squares = type.generate(songs, arrangement.state);
}
