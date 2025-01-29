import type { SongInfo } from "./Song.ts";

export type FilterRequest = {
    date: { start: number | null, end: number | null},
} 

export type DisplayDataRequest = {
    aggregate: "song" | "album",
    num_cells: number | null,
    rank_determinant: "listens" | "time",
} & FilterRequest; 

export type ListeningDataRequest = {
    
}
export type RankOutput = {
    song: SongInfo,
    quantity: number
}[];

export type ContextDataRequest = {
    upc: string
    date: DisplayDataRequest["date"],
    rank_determinant: DisplayDataRequest["rank_determinant"],
};

export type ContextDataResponse = {
    songs: RankOutput
}