import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({locals: { supabase, session }, url}) => {
    if (session !== null) {
        // determine if users have clicked the 'log in with spotify' button or are just trying to load the page
        if (url.searchParams.get("link") === "true") {
            const headers = {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
            const { data, error } = await supabase.functions.invoke("spotify-login", headers)
    
            if (error) {
                // TODO: tell the user that the link failed and to try again
                throw Error(error)
            }
    
            console.log(data)
            redirect(302, data)
        }
    } else {
        throw Error("User does not have session.") 
    }
}; 