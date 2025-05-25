import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
    locals: { safeGetSession, profile },
    cookies,
}) => {
    const { session } = await safeGetSession();
    return {
        session,
        cookies: cookies.getAll(),
        profile
    };
};
