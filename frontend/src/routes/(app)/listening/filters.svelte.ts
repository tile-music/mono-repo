import type { ListeningDataRequest, ListeningColumns} from "../../../../../lib/Request";

export const listeningColumns: ListeningColumns = $state({
    listened_at: { column: {start:null, end: null }, order: "desc"},
    song: { column: [], order: ""},
    album: { column: [], order: ""},
    artist: { column: [], order: ""},
    duration: { column: {start: null, end: null}, order: ""},
    listen: { column: [], order: ""},
    upc: null,
    spotify_track_id: null,
    spotify_album_id: null,
    isrc: { column: [], order: ""}
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