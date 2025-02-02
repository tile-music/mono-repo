export type SongInfo = {
  isrc: string
  title: string
  artists: string[]
  duration: number
  listened_at: number
  albums: AlbumInfo[]
}

export type ListeningDataResponse = SongInfo & {
  repetitions: number,
  plays: number
};


export type AlbumInfo = {
  title: string
  tracks: number
  release_day: number,
  release_month: number,
  release_year: number,
  artists: string[]
  image: string
}
