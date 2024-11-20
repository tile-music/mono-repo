import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'


/**
 * Handles the server-side loading for the Spotify link page.
 * 
 * This function checks if the user has an active session and if they have clicked the 'log in with Spotify' button.
 * If the button is clicked, it invokes the 'spotify-login' function using Supabase and handles the response.
 * 
 * @param {Object} context - The context object containing locals and URL.
 * @param {Object} context.locals - The locals object containing Supabase and session information.
 * @param {Object} context.locals.supabase - The Supabase client instance.
 * @param {Object} context.locals.session - The current user session.
 * @param {URL} context.url - The URL object representing the current request URL.
 * 
 * @throws Will throw an error if the user does not have a session or if the Spotify link process fails.
 * 
 * @returns {Promise<void>} - A promise that resolves when the function completes.
 */
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
    
            redirect(302, data)
        }
    } else {
        throw Error("User does not have session.") 
    }
}; 