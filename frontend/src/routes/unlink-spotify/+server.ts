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
        const { data, error } = await supabase.auth.getUser();
        console.log("data", data)
        const userId = data.user?.id;
        console.log("userId", userId);
        const { data: dbData, error: error2 } = await supabase
            .from("spotify_credentials")
            .delete()
            .eq("id", userId);


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