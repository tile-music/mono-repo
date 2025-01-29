import type { ListeningDataRequest } from "../../../../../lib/Request";

export const filters: ListeningDataRequest = $state({
    column: "listened_at",
    order: "desc",
    date: { start: null, end: null }
})