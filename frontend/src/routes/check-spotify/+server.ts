// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';


export const POST: RequestHandler = async ({locals: { supabase, session }, request}) => {
    let body = await request.json();
    if(session !== null) {
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
        const { data, error } = await supabase.functions.invoke("check-spotify", headers)
        console.log("data", data)


        if (error) {    
            // TODO: tell the user that the link failed and to try again
            throw Error(error)
        }
        switch (data) {
            case "spotify logged in":
                body = JSON.stringify({ spotify: true });
                break;
            default:
                body = JSON.stringify({ spotify: false });
                break;
        }
        console.log(body);
        console.log(request)


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