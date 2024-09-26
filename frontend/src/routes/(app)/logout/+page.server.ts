import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ locals }) => {
    await locals.supabase.auth.signOut();
	throw redirect(307, '/');
}
