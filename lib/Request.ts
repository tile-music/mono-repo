import type { SongInfo } from "./Song.ts";

export type DisplayDataRequest = {
    aggregate: "song" | "album",
    num_cells: number | null,
    date: { start: string | null, end: string | null},
    rank_determinant: "listens" | "time",
};

export type RankOutput = {
    song: SongInfo,
    quantity: number
}[];