import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { validateAccountForm } from "../validateAccountForm";
import { assembleBlankProfile } from "../../(app)/profile/profile";

export const actions: Actions = {
    register: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const form = validateAccountForm("register", formData);
        if (!form.valid) return fail(422, form);

        const loginData = {
            email: form.data.email!,
            password: form.data.password!,
        };

        const { error: register_error } = await supabase.auth.signUp(loginData);
        if (register_error) {
            // check if user already exists
            if (register_error.code == "user_already_exists") {
                form.failures.general = "This email is already taken";
                return fail(422, form);
            }

            // encountered some other registration error
            console.error(register_error);
            form.failures.general =
                "An unexpected error occurred during registration";
            return fail(422, form);
        }

        const { data, error: login_error } =
            await supabase.auth.signInWithPassword(loginData);
        if (login_error) {
            console.error(login_error);
            redirect(303, "/login");
        }

        // insert new user profile
        const blankProfile = assembleBlankProfile(
            data.session.user.id,
            data.session.user.email,
        );
        const { error: insertError } = await supabase
            .from("profiles")
            .insert(blankProfile);
        if (insertError) console.error(insertError);

        redirect(303, "/link-spotify");
    },
};
