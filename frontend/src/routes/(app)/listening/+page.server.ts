import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session !== null) {
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
        const { data, error } = await supabase.functions.invoke("get-user-data", headers)

        if (error) {
            console.log(error)
        }

        const song_data: any[] = JSON.parse(data)
        const songs: {
            album_art_path: string
            title: string
            artists: string[]
            album: string
        }[] = []

        for (const song of song_data) {
            songs.push({
                album_art_path: song.track_album.image,
                title: song.track_name,
                artists: song.track_artists,
                album: song.track_album.album_name
            })
        }
        return { songs: songs ?? null }
    } else {
        throw Error("User does not have session.") 
    }
}; 
