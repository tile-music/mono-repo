import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { validateAccountForm } from "../validateAccountForm";

export const actions: Actions = {
    login: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const form = validateAccountForm("login", formData);
        if (!form.valid) {
            return fail(422, { failures: form.failures });
        }

        const { error } = await supabase.auth.signInWithPassword(form.data);
        if (error) {
            return fail(422, { invalidCredentials: true });
        } else {
            redirect(303, "/profile");
        }
    },
};
