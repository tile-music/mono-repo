import {log} from "$lib/log"
/**
 * Creates a blank profile.
 *
 * Sets username to the local-part of the email (the part before the @ symbol),
 * as long as it is three or more characters. If it is not, the username is left blank.
 *
 * @param id The user's id
 * @param email The user's email, if available
 * @returns A new profile object that can displayed or used in database inserts
 */
export function assembleBlankProfile(id: string, email?: string) {
    let username = "";
    log(5, `email ${email}, id ${id}`)
    if (email) {
        const domain = email.split("@")[0];
        if (domain.length >= 3) username = domain;
    }

    // insert blank profile
    return {
        id: id,
        updated_at: new Date(),
        username: username,
        name: "",
        avatar_id: "",
        theme: "dark",
    };
}
