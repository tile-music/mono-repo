import type { Arrangement, ArrangementOptions, ArrangementState, SquareInfo } from "../arrangement.svelte";
import { generateFullArrangement } from "./pack";

const options: ArrangementOptions = {
    offset_min: { type: "number", label: "min offset", default: 0 },
    offset_max: { type: "number", label: "max offset", default: 0.1 }
};

export const Cluster: Arrangement<typeof options> = {
    options: options,
    generate: (num_squares: number, state: ArrangementState<typeof options>): SquareInfo[] => {
        // skip computation if no squares are being generated
        if (num_squares == 0) return [];
    
        // 1 square requires no computation
        if (num_squares == 1) return [{ x: 0, y: 0, size: 1 }];
    
        const max = Math.min(num_squares, 14);
        const arrangement = generateFullArrangement(
          1,
          Math.max(max, 0),
          max,
          state.offset_min,
          state.offset_max,
        );
    
        // translate the output of arrangement into a form usable by the Square component
        const squares: { x: number; y: number; size: number }[] = [];
        for (const square of arrangement) {
          squares.push({ x: square.x, y: square.y, size: square.width });
        }
    
        return squares;
    }
}