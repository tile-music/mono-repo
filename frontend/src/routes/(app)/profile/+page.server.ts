import type { PageServerLoad } from './$types'
import type { Actions } from './$types'

export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session !== null) {
        // fetch profile data
        let { data: user, error } = await supabase
        .from('profiles')
        .select(`updated_at, username, full_name, website, avatar_url`)
        .eq('id', session.user.id)
        .single()

        if (error && error.code == "PGRST116") {
            // insert new user profile
            const blankProfile = assembleBlankProfile(session.user.id, session.user.email)
            const { error: insertError } = await supabase.from('profiles').insert(blankProfile);
            if (insertError) console.error(insertError)
            else user = blankProfile
        } else if (error) {
            console.error(error);
        }

        // return the retrieved user, or the blank user if no profile was found
        return { user: user ?? null, email: session.user.email ?? null }; 
    } else {
        throw Error("User does not have session.") 
    }

};

export const actions: Actions = {
    update_profile: async ({ request, locals: { supabase, session } }) => {
        if (session !== null) {
            const formData = await request.formData()

            const update = {
                id: session?.user.id,
                updated_at: new Date(),
                username: formData.get('username') as string,
                full_name: formData.get('full_name') as string,
                website: formData.get('website') as string,
                avatar_url: null,
            }
      
            const { error } = await supabase.from('profiles').upsert(update)
            if (error) console.error(error)
        } else {
            throw Error("User does not have session.") 
        }
    },
    reset_profile: async ({ request, locals: { supabase, session } }) => {
        if (session !== null) {
            const blankProfile = assembleBlankProfile(session.user.id, session.user.email);
            const { error } = await supabase.from('profiles').upsert(blankProfile);
            if (error) console.error(error);
        } else {
            throw Error("User does not have session.") 
        }
    }
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
