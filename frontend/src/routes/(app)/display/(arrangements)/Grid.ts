import type { Arrangement, ArrangementState, AggregatedSongs } from "../arrangement.svelte";

const options = {
    width: { type: "number", label: "width", min: 1, max: 25},
    height: { type: "number", label: "height", min: 1, max: 25},
    size_modifier: { type: "select", label: "size modifier", values: ["none", "linear"]}
} as const;

const state: ArrangementState<typeof options> = {
    width: 3,
    height: 4,
    size_modifier: "linear"
} as const;

function generate(songs: AggregatedSongs, s: ArrangementState<typeof options>) {
    const squares = [];
    let y = 0;
    let row_width = s.width;
    for (let i = 0; i < s.height; i++) {
        if (y + 1 / row_width > 1) break;
        for (let j = 0; j < row_width; j++)
            squares.push({ x: j / row_width, y: y, size: 1 / row_width });
        y += 1 / row_width;
        if (s.size_modifier == "linear") row_width++;
    }
    squares.length = Math.min(songs.length, squares.length);
    return squares
}

export const Grid: Arrangement<typeof options> = {
    options, state, generate
}