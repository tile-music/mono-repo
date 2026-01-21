import type { SongInfo } from "./Song.ts";

/**
 * Represents a request to filter data based on a date range.
 */
export type FilterRequest = {
    date: { start: number | null; end: number | null };
};

/**
 * Represents a request for display data.
 */
export type DisplayDataRequest = {
    aggregate: "song" | "album";
    num_cells: number | null;
    rank_determinant: "listens" | "time";
} & FilterRequest;

/**
 * Represents a request for context data.
 */
export type ContextDataRequest = {
    upc: string;
    date: DisplayDataRequest["date"];
    rank_determinant: DisplayDataRequest["rank_determinant"];
};

/**
 * Represents the output of a ranking operation.
 */
export type RankOutput = {
    song: SongInfo;
    quantity: number;
}[];

/**
 * Represents the response containing context data.
 */
export type ContextDataResponse = {
    songs: RankOutput;
};
