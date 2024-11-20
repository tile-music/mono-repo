// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';


/**
 * Handles POST requests to check the Spotify login status of a user.
 * 
 * @param {Object} context - The context object containing locals and request.
 * @param {Object} context.locals - Local variables passed to the handler.
 * @param {Object} context.locals.supabase - Supabase client instance.
 * @param {Object} context.locals.session - User session object.
 * @param {Request} context.request - The incoming request object.
 * 
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 * 
 * @throws {Error} - Throws an error if the Supabase function invocation fails.
 */
export const POST: RequestHandler = async ({locals: { supabase, session }, request}) => {
    let body = await request.json();
    if(session !== null) {
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
        const { data, error } = await supabase.functions.invoke("check-spotify", headers)


        if (error) {    
            // TODO: tell the user that the link failed and to try again
            throw Error(error)
        }
        switch (data) {
            case "spotify logged in":
                body = "spotify logged in";
                break;
            default:
                body = "spotify login not found";
                break;
        }

        return new Response(JSON.stringify(body), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }else{
        body = JSON.stringify({error: "User does not have session."})
        return new Response( body, {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

};