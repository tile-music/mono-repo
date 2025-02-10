import type { off } from "process";
import type { SongInfo } from "./Song.ts";

/**
 * general types:
 * 
 * @alias FilterRequest 
 */


/**
 * Represents a request to filter data based on a date range.
 * 
 * @property date - An object containing the start and end dates for the filter.
 * @property date.start - The start date of the filter range, represented as a timestamp or null.
 * @property date.end - The end date of the filter range, represented as a timestamp or null.
 */
export type FilterRequest = {
    date: { start: number | null, end: number | null},
} 

/**
 * art display types:
 * these types are used to request data for the art display.
 * 
 * @alias DisplayDataRequest
 * @alias ContextDataRequest
 * @alias ContextDataResponse
 * @alias RankOutput
 */
/**
 * Represents a request for display data.
 * 
 * @typedef {Object} DisplayDataRequest
 * @property {"song" | "album"} aggregate - The type of data to aggregate.
 * @property {number | null} num_cells - The number of cells to display, or null if not specified.
 * @property {"listens" | "time"} rank_determinant - The determinant for ranking the data.
 * @extends FilterRequest
 */
export type DisplayDataRequest = {
    aggregate: "song" | "album",
    num_cells: number | null,
    rank_determinant: "listens" | "time",
} & FilterRequest;

/**
 * Represents a request for context data.
 * 
 * @typedef {Object} ContextDataRequest
 * @property {string} upc - The Universal Product Code (UPC) of the item.
 * @property {DisplayDataRequest["date"]} date - The date associated with the request, derived from DisplayDataRequest.
 * @property {DisplayDataRequest["rank_determinant"]} rank_determinant - The rank determinant associated with the request, derived from DisplayDataRequest.
 */
export type ContextDataRequest = {
    upc: string
    date: DisplayDataRequest["date"],
    rank_determinant: DisplayDataRequest["rank_determinant"],
};

/**
 * Represents the output of a ranking operation.
 * 
 * @typedef {Object} RankOutput
 * @property {SongInfo} song - Information about the song.
 * @property {number} quantity - The quantity associated with the song.
 */
export type RankOutput = {
    song: SongInfo,
    quantity: number
}[];

/**
 * Represents the response containing context data.
 * 
 * @property {RankOutput} songs - The ranked output of songs.
 */
export type ContextDataResponse = {
    songs: RankOutput
}

/**
 * Listening types:
 * These types are used to request data for the listening display and for page logic,
 * which im trying having all defined together. 
 * @alias ListeningDataRequest
 */
export type ListeningColumn<T> = {
    column: T;
    order: "asc" | "desc" | "";
    checked: boolean;
}


export type ListeningColumns = {
    listened_at: ListeningColumn<DateFilter>;
    title: ListeningColumn<TitleColumn>;
    album: ListeningColumn<TitleColumn>;
    artist: ListeningColumn<TitleColumn>;
    duration: ListeningColumn<DurationFilter>;
    upc: ListeningColumn<TitleColumn>;
    spotify_track_id: ListeningColumn<SpotifyURI>;
    spotify_album_id: ListeningColumn<SpotifyURI>;
    isrc: ListeningColumn<ISRCColumn>; 
    listens: ListeningColumn<ListenCountColumn>;

}

export type ListeningColumnKeys = keyof ListeningColumns;

/* export type ListeningDataSongInfo = {
    plays: number;
    repetitions: number;
} & SongInfo;
 */
export type ListeningDataRequest = {
    limit: number;
    offset: number;
} & ListeningColumns;

export type ListeningDataResponse = {
};

export type DateFilter = {
    start: HTMLDate | null;
    end: HTMLDate | null;
}

export type HTMLDate = string;

export const assertDate = (d: HTMLDate): asserts d is HTMLDate =>
    validate([d], /^\d{4}-\d{2}-\d{2}$/, "Date");

export type MinuetesTimeFormat = string;

export const assertMinutesTimeFormat = (d: MinuetesTimeFormat): asserts d is MinuetesTimeFormat =>
    validate([d], /^[0-9]+:[0-9]{2}/, "Duration");

export type DurationFilter = {
    start: MinutesTimeFormat | null;
    end: MinutesTimeFormat | null;
}
export type MinutesTimeFormat = string;
export type TitleColumn = string[];

/**
 * Represents a type alias for `TitleColumn`.
 * This type is used to define a Spotify URI (Uniform Resource Identifier).
 */
export type SpotifyURI = TitleColumn;

/**
 * Represents a type alias for `TitleColumn`.
 * This type is used to define a column in a UPC (Universal Product Code) related context.
 */
export type UPCColumn = TitleColumn;

export const assertTitleColumn = (titles: string[]): asserts titles is TitleColumn => {
    if(!titles.length) throw new Error
}

/**
 * Asserts that the provided array of strings are valid UPC codes.
 * 
 * A UPC (Universal Product Code) is a 12-digit number used to uniquely identify a product.
 * This function checks each string in the array against a regular expression to ensure it
 * matches the UPC format.
 * 
 * @param titles - An array of strings to be validated as UPC codes.
 * 
 * @throws {Error} If any string in the array does not match the UPC format.
 * 
 * sources:
 *   https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
 *   https://stackoverflow.com/questions/46782710/regex-for-upc-a-type-barcodes
 * 
 * I have no idea really when these run????? i just stumbled across them
 * 
 * @todo add support for all types of upcs before
 */
export const assertUPC = (upcs: string[]): asserts upcs is UPCColumn => 
    validate(upcs, /^(?=.*0)[0-9]{12}$/, "UPC");

export type ISRCColumn = TitleColumn;

export const validateISRC = (isrcs: string[]): asserts isrcs is ISRCColumn => 
    validate(isrcs, /^[A-Z]{2}-?\w{3}-?\d{2}-?\d{5}$/, "ISRC");

export type ListenCountColumn = number[];

const validate = (t: string[], regex: RegExp, message?: string) =>
    t.forEach(t => {if(!regex.test(t)) throw new Error(`"${t}" is not a valid ${message}.`)});
