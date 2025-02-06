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

export type ArrangementOptions = Record<string, {
    type: "number";
    label: string;
    default: number;
} | {
    type: "checkbox";
    label: string;
    default: boolean
}>

export type ArrangementState<T extends ArrangementOptions> = {
    [P in keyof T]: T extends { type: "number" } ? number : boolean
}

export type Arrangement<Options extends ArrangementOptions> = {
    options: Options;
    generate: (num_squares: number, state: ArrangementState<Options>) => SquareInfo[];
}

/**
 * Generates an arrangement with user-defined options. Returns a list
 * of square positions, sizes, and optional rotations.
 */
export function generateArrangement() {
}