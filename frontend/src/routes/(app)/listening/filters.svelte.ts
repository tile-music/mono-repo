import type { ListeningDataRequest, ListeningColumns} from "../../../../../lib/Request";

export const listeningColumns: ListeningColumns = $state({
    listened_ats: { column: {start:null, end: null }, order: "desc"},
    songs: { column: [], order: ""},
    albums: { column: [], order: ""},
    artists: { column: [], order: ""},
    durations: { column: {start: null, end: null}, order: ""},
    listens: { column: [], order: ""},
    upcs: null,
    spotify_track_ids: null,
    spotify_album_ids: null,
    isrcs: { column: [], order: ""}
} as ListeningColumns)

/* export const listeningColumns: ListeningColumns = $state({
    listened_at: { date:{start:null, end: null }, order: "dsc"},
    songs: { column: [], order: ""},
    albums: { column: [], order: ""},
    artists: { column: [], order: ""},
    duration: { start: null, end: null, order: ""},
    upcs: { column: [], order: ""},
    spotify_track_uri: { column: [], order: ""},
    spotify_album_uri: { column: [], order: ""},
    isrcs: { column: [], order: ""},
    listens: { column: [], order: ""}
}) */