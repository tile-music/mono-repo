import type { PageServerLoad } from './$types'
import type { Actions } from './$types'
import { error } from '@sveltejs/kit';
import type { DisplayDataRequest } from '../../../../../lib/Request';
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";


export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session == null) throw Error("User does not have session.");

    // assemble request body
    const filters: DisplayDataRequest = {
        aggregate: "album",
        num_cells: null,
        date: { start: null, end: null},
        rank_determinant: "listens"
    };

    // send request
    const { data, error } = await supabase.functions.invoke("get-display-data", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: filters
    });
    
    // handle edge function errors
    if (error) {
        let errorMessage;
        if (error instanceof FunctionsHttpError)
            errorMessage = await error.context.text();
        else if (error instanceof FunctionsRelayError)
            errorMessage = "Relay error";
        else if (error instanceof FunctionsFetchError)
            errorMessage = "Fetch Error";

        return { error: errorMessage };
    }

    // parse and return list of songs
    const songs = JSON.parse(data);
    return { songs };
}; 

export const actions: Actions = {
    refresh: async ({ request, locals: { supabase, session } }) => {
        if (session == null) return error(401, "Not authenticated");

        const body = await request.json();
        console.log(body);

        // send request
        const { data, error: functionError } = await supabase.functions.invoke("get-display-data", {
            headers: { Authorization: `Bearer ${session.access_token}` }, body
        });
        
        // handle edge function errors
        if (functionError) {
            if (functionError instanceof FunctionsHttpError)
                return error(400, await functionError.context.text());
            else if (functionError instanceof FunctionsRelayError)
                return error(500, "Relay error");
            else if (functionError instanceof FunctionsFetchError)
                return error(500, "Fetch error");
        }

        // parse and return list of songs
        return { songs: JSON.parse(data) };
    }
}