import type { ListeningDataRequest, ListeningColumns } from "../../../../../lib/Request";

export type FiltersListening = {
    column: ListeningColumns;
    order: "asc" | "desc";
    dateString: { start: string | null, end: string | null }
}

export const filters: ListeningDataRequest = $state({
    column: "listened_at",
    order: "desc",
    date: { start: null, end: null }
})

export const filtersListening: FiltersListening = $state({
    column: "listened_at",
    order: "desc",
    dateStrings: { start: null, end: null }
})