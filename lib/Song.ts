export type SongInfo = {
  isrc: string
  title: string
  artists: string[]
  duration: number
  listened_at: number
  spotify_id: string
  albums: AlbumInfo[]
}

/* export function validSongType(s: SongInfo) asserts s is SongInfo{

} */
export type ListeningDataSongInfo = SongInfo & { 
    child?: ListeningDataSongInfo;
    is_child: boolean;
    has_children: boolean;
    show_children?: boolean;
    num_children?: number;
    is_parent: boolean;
    inserted: boolean;
    size: number;
}

export type AlbumInfo = {
  title: string
  tracks: number
  release_day: number,
  release_month: number,
  release_year: number,
  artists: string[]
  image: string,
  upc: string,
  spotify_id: string
}
