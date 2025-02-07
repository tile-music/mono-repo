import type { Arrangement, ArrangementState } from "../arrangement.svelte";

const options = {
    width: { type: "number", label: "width", min: 1, max: 5},
    height: { type: "number", label: "height", min: 1, max: 5}
} as const;

const state: ArrangementState<typeof options> = {
    width: 3,
    height: 3
} as const;

function generate(_: number | null, s: ArrangementState<typeof options>) {
    const squares = [];
    const size = 1 / Math.max(s.width, s.height);
    for (let i = 0; i < s.width; i++)
        for (let j = 0; j < s.height; j++)
            squares.push({ x: i / s.width, y: j / s.height, size });
    return squares
}

export const Grid: Arrangement<typeof options> = {
    options, state, generate
}