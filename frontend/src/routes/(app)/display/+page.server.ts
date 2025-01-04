import type { Actions } from './$types'
import { error } from '@sveltejs/kit';
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

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