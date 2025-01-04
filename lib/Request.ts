import type { SongInfo } from "./Song.ts";

export type DisplayDataRequest = {
    aggregate: "song" | "album",
    num_cells: number | null,
    date: { start: number | null, end: number | null},
    rank_determinant: "listens" | "time",
};

export type RankOutput = {
    song: SongInfo,
    quantity: number
}[];