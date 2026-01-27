export type SongInfo = {
    isrc: string;
    title: string;
    artists: string[];
    duration: number;
    listened_at: number;
    spotify_id: string;
    albums: AlbumInfo[];
};

export type AlbumInfo = {
    title: string;
    tracks: number;
    release_day: number;
    release_month: number;
    release_year: number;
    artists: string[];
    image: string;
    upc: string;
    spotify_id: string;
};
