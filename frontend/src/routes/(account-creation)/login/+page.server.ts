import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { validateAccountForm } from "../validateAccountForm";

export const actions: Actions = {
    login: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const form = validateAccountForm("login", formData);
        if (!form.valid) return fail(422, form);

        const loginData = {
            email: form.data.email!,
            password: form.data.password!,
        };

        const { error: login_error } =
            await supabase.auth.signInWithPassword(loginData);
        if (login_error) {
            form.failures.general = "Invalid email or password.";
            return fail(422, form);
        } else {
            redirect(303, "/profile");
        }
    },
};
