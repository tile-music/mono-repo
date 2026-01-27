import { log } from "$lib/log";
import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { queryListeningData } from "./utils/query";
import {
    validateListeningDataRequest,
    type ListeningDataRequest,
} from "./utils/request";
import type { SongInfo } from "$shared/Song";

export const load: PageServerLoad = async ({ locals: { user, profile } }) => {
    if (!user || !profile) {
        log(3, "User or profile not found in protected route.");
        throw redirect(307, "/login");
    }

    let songs: SongInfo[] = [];
    let status: "success" | "error" | "loading" = "success";
    let error: string | null = null;

    try {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);

        songs = await queryListeningData(user.id, {
            order: "newest",
            date: currentDate.toISOString().split("T")[0],
            offset: 0,
            limit: 50,
        });

        status = "success";
    } catch (e) {
        error =
            typeof e === "string" ? e : "Error when querying listening data";
        status = "error";
    }

    return { songs, status, error, title: "Listening Data" };
};

type ActionsResponse = {
    success: boolean;
    failures: Record<string, string>;
    songs: SongInfo[];
};

export const actions = {
    default: async ({ request, locals: { user } }) => {
        const response: ActionsResponse = {
            success: false,
            failures: {},
            songs: [],
        };

        if (!user) {
            response.failures.general = "Not authenticated";
            return fail(401, response);
        }

        const formData = await request.formData();

        let options: ListeningDataRequest;
        try {
            options = validateListeningDataRequest(formData);
        } catch (error) {
            response.failures.general = error as string;
            return fail(400, response);
        }

        try {
            response.songs = await queryListeningData(user.id, options);
        } catch (error) {
            response.failures = error as Record<string, string>;
            return fail(500, response);
        }

        response.success = true;
        return response;
    },
} satisfies Actions;
