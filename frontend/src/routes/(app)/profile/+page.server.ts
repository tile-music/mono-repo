import type { PageServerLoad } from './$types'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session == null) throw Error("User does not have session.");

    // fetch profile data
    let { data: user, error } = await supabase
    .from('profiles')
    .select(`updated_at, username, full_name, website, avatar_url`)
    .eq('id', session.user.id)
    .single()

    // check if user profile does not exist
    if (error && error.code == "PGRST116") {
        // insert new user profile
        const blankProfile = assembleBlankProfile(session.user.id, session.user.email)
        const { error: insertError } = await supabase.from('profiles').insert(blankProfile);
        if (insertError) console.error(insertError)
        else user = blankProfile;
    } else if (error) {
        console.error(error);
    }

    // return the retrieved user, or the blank user if no profile was found
    return { user: user!, email: session.user.email! }; 

};

export const actions: Actions = {
    update_profile: async ({ request, locals: { supabase, session } }) => {
        if (session == null) return fail(401, { not_authenticated: true});

        // assemble update object
        const formData = await request.formData()
        const update = {
            id: session?.user.id,
            updated_at: new Date(),
            username: formData.get('username') as string,
            full_name: formData.get('full_name') as string,
            website: formData.get('website') as string,
            avatar_url: null,
        }
  
        // attempt to perform update
        const { error } = await supabase.from('profiles').upsert(update)
        if (error) {
            console.log(error);
            if (error.code === '23514') return fail(400, { username_too_short: true });
            else return fail(500, { server_error: true });
        }

        return { success: true }
    },

    reset_profile: async ({ request, locals: { supabase, session } }) => {
        if (session == null) return fail(401, { not_authenticated: true});

        const blankProfile = assembleBlankProfile(session.user.id, session.user.email);
        const { error } = await supabase.from('profiles').upsert(blankProfile);
        if (error) {
            console.error(error); // log unexpected error
            return fail(500, { server_error: true });
        }

        return { success: true, user: JSON.stringify(blankProfile) };
    },

    reset_listening_data: async ({ request, locals: { supabase, session } }) => {
        console.log(request);
        if (session == null) return fail(401, { not_authenticated: true});

        // attempt to reset listening data
        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        };
        const { data } = await supabase.functions.invoke("reset-listening-data", headers);

        // handle errors
        const response = JSON.parse(data);
        return response;
    },
}

// TODO: TEST THISSSSS
function assembleBlankProfile(id: string, email?: string) {
    let username = null;
    if (email) {
        const domain = email.split('@')[0];
        if (domain.length >= 3) username = domain;
    }

    // insert blank profile
    return {
        id: id,
        updated_at: new Date(),
        username,
        full_name: null,
        website: null,
        avatar_url: null
    }
}
