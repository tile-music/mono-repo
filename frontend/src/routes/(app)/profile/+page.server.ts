import type { PageServerLoad } from './$types'
import type { Actions } from './$types'

export const load: PageServerLoad = async ({locals: { supabase, session } }) => {
    if (session !== null) {
        const { data: user } = await supabase
        .from('profiles')
        .select(`updated_at, username, full_name, website, avatar_url`)
        .eq('id', session.user.id)
        .single()
        return { user: user ?? null }; 
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
                avatar_url: formData.get('avatar_url') as string,
            }
      
            const { error } = await supabase.from('profiles').upsert(update)
            if (error) {
                console.error(error)
            }
        } else {
            throw Error("User does not have session.") 
        }
    }
  }
