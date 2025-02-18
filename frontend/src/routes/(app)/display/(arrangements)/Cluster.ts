import type { Arrangement, ArrangementState, AggregatedSongs } from "../arrangement.svelte";
import { generateFullArrangement } from "./pack";

// Options
const options = {
  offset_min: { type: "number", label: "min offset", min: 0.0, max: 0.3, step: 0.05 },
  offset_max: { type: "number", label: "max offset", min: 0.0, max: 0.3, step: 0.05 }
} as const;

// Defaults
const state: ArrangementState<typeof options> = {
  offset_min: 0.05,
  offset_max: 0.15
}

// Generate function
function generate(songs: AggregatedSongs, s: ArrangementState<typeof options>) {
  // skip computation if no squares are being generated
  if (songs.length == 0) return [];

  // 1 square requires no computation
  if (songs.length == 1) return [{ x: 0, y: 0, size: 1 }];

  const max = Math.min(songs.length, 14)
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

  return squares;
}

export const Cluster: Arrangement<typeof options> = {
    options, state, generate
}