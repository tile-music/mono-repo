// TODO: TEST THISSSSS
export function assembleBlankProfile(id: string, email?: string) {
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