export type SongInfo = {
    isrc: string
    title: string
    artists: string[]
    duration: number
    albums: AlbumInfo[]
}

export type AlbumInfo = {
    title: string
    tracks: number
    release_date: Date
    artists: string[]
    image: string
}