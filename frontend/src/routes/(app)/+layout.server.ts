import type { LayoutServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";
import type { Profile } from "$shared/Profile";
import { log } from "$lib/log";
import { assembleBlankProfile } from "./profile/profile";

export const load: LayoutServerLoad = async ({
    locals: { user, profile, supabase },
}) => {
    if (!user) {
        console.log("User is unauthenticated in protected route");
        throw redirect(307, "/logout");
    }

    if (!profile) {
        console.log("Registered user doesn't have a profile");

        const blankProfile = assembleBlankProfile(user.id, user.email);
        const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert(blankProfile, {
                onConflict: "id",
            })
            .select();

        if (insertError || !newProfile || !newProfile[0]) {
            const insertErrorMessage =
                "Error inserting blank profile: " +
                (insertError
                    ? insertError.message
                    : "profile was created but not returned");
            log(2, insertErrorMessage);
            throw error(500, "Server error while creating profile");
        }

        // could be worth validating this just in case
        const profile: Profile = {
            id: newProfile[0].id,
            updated_at: newProfile[0].updated_at,
            username: newProfile[0].username,
            full_name: newProfile[0].full_name,
            avatar_url: newProfile[0].avatar_url,
            website: newProfile[0].website,
            theme: newProfile[0].theme,
        };

        log(4, "Blank profile created successfully for user " + user.id);
        return { profile };
    }

    return { profile };
};
