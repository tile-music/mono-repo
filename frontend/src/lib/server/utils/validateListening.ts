import type {
    ListeningColumns,
    ListeningColumnKeys,
} from "../../../../../lib/Request";

export function assertListeningColumns(
    columns: unknown,
): asserts columns is ListeningColumns {
    if (typeof columns !== "object" || columns === null)
        throw new Error("Invalid listening columns: not an object");

    let orderCount = 0;
    let nullCount = 0;
    if (!("listened_at" in columns) || columns.listened_at === undefined)
        throw new Error("listened_ats is required");
    if (!("title" in columns) || columns.title === undefined)
        throw new Error("songs is required");
    if (!("album" in columns) || columns.album === undefined)
        throw new Error("albums is required");
    if (!("artist" in columns) || columns.artist === undefined)
        throw new Error("artists is required");
    if (!("duration" in columns) || columns.duration === undefined)
        throw new Error("durations is required");
    if (!("upc" in columns) || columns.upc === undefined)
        throw new Error("upcs is required");
    if (
        !("spotify_track_id" in columns) ||
        columns.spotify_track_id === undefined
    )
        throw new Error("spotify_track_ids is required");
    if (
        !("spotify_album_id" in columns) ||
        columns.spotify_album_id === undefined
    )
        throw new Error("spotify_album_ids is required");
    if (!("isrc" in columns) || columns.isrc === undefined)
        throw new Error("isrcs is required");
    if (!("listens" in columns) || columns.listens === undefined)
        throw new Error("listens is required");
    const keys: ListeningColumnKeys[] = Object.keys(
        columns,
    ) as ListeningColumnKeys[];
    for (const key of keys) {
        if (columns[key] === null) nullCount++;
        if (nullCount > keys.length - 1)
            throw new Error(`At least one column is required`);
        if (columns[key]?.order === "asc" || columns[key]?.order === "desc")
            orderCount++;
        if (orderCount > 1)
            throw new Error(`Only one column can be ordered at a time`);
    }
}
