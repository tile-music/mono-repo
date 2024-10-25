import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session !== null) {
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
        const { data, error } = await supabase.functions.invoke("get-user-data", headers)
        if (error) console.log(error)

        const songs = JSON.parse(data)
        return { songs }
    } else {
        throw Error("User does not have session.") 
    }
}; 
