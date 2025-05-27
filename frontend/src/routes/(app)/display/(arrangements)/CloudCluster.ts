import type {
    Arrangement,
    ArrangementState,
    AggregatedSongs,
    SquareInfo,
} from "../arrangement.svelte";
import { generateFullArrangement } from "./pack";

const options = {
    offset_min: {
        type: "number",
        label: "min offset",
        min: 0.0,
        max: 0.3,
        step: 0.05,
    },
    offset_max: {
        type: "number",
        label: "max offset",
        min: 0.0,
        max: 0.3,
        step: 0.05,
    },
} as const;

const state: ArrangementState<typeof options> = {
    offset_min: 0.05,
    offset_max: 0.15,
};

function generate(songs: AggregatedSongs, s: ArrangementState<typeof options>) {
    // skip computation if no squares are being generated
    if (songs.length == 0) return { list: [], width: 1, height: 1 };

    // 1 square requires no computation
    if (songs.length == 1) return { list: [{ x: 0, y: 0, size: 1 }], width: 1, height: 1 };

    const max = Math.min(songs.length, 14);
    const arrangement = generateFullArrangement(
        1,
        Math.max(max, 0),
        max,
        s.offset_min,
        s.offset_max,
    );

    // translate the output of arrangement into a form usable by the Square component
    const squares: { x: number; y: number; size: number }[] = [];
    for (const square of arrangement) {
        squares.push({ x: square.x, y: square.y, size: square.width });
    }

    return fitBoundaryBox(squares, 1);
}

/**
 * fits a boundary box around the squares, fitting square coordinates within them.
 * @param squares the squares to fit
 * @param gs the grid size
 * @returns the fit squares and the width and height of the arrangement
 */
function fitBoundaryBox(squares: SquareInfo[], gs: number) {
    // find minimum and maximum coordinate values that squares occupy
    const bounds = { left: gs, right: 0, top: gs, bottom: 0 };
    for (const square of squares) {
        if (square.x < bounds.left) bounds.left = square.x;
        if (square.x + square.size > bounds.right)
            bounds.right = square.x + square.size;
        if (square.y < bounds.top) bounds.top = square.y;
        if (square.y + square.size > bounds.bottom)
            bounds.bottom = square.y + square.size;
    }

    // fit squares to the top left corner of the grid
    const mapped_squares = squares.map((square) => {
        return {
            x: square.x - bounds.left,
            y: square.y - bounds.top,
            size: square.size,
        }
    });

    return {
        list: mapped_squares,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
    }
}

export const CloudCluster: Arrangement<typeof options> = {
    options,
    state,
    generate,
};
