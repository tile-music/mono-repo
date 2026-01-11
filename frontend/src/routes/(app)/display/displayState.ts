// IMPORTS
import { createContext } from "svelte";
import type { DisplayDataRequest } from "$shared/Request";

// STATE
export const [getDisplayState, setDisplayState] = createContext<DisplayState>();

// TYPES AND FUNCTIONS

export type DisplayState = {
    filters: DisplayDataRequest;
    context: FiltersContext;
    options: GeneralOptions;
};

interface FiltersContext {
    timeFrame: TimeFrame;
    dateStrings: DateStrings;
}

interface GeneralOptions {
    showCellInfo: ShowCellInfo;
}

export type TimeFrame =
    | "this-week"
    | "this-month"
    | "year-to-date"
    | "this-year"
    | "all-time"
    | "custom";

export type DateStrings = {
    start: string | null;
    end: string | null;
};

export type ShowCellInfo = "never" | "on-hover" | "always";

export function initializeDisplayState(): DisplayState {
    return {
        filters: {
            aggregate: "album",
            num_cells: null,
            date: { start: null, end: null },
            rank_determinant: "listens",
        },
        context: {
            timeFrame: "all-time",
            dateStrings: { start: null, end: null },
        },
        options: {
            showCellInfo: "on-hover",
        },
    };
}

export function timeFrameToText(tf: TimeFrame, ds: DateStrings) {
    switch (tf) {
        case "this-week":
            return "this week";
        case "this-month":
            return "this month";
        case "year-to-date":
            return "year to date";
        case "this-year":
            return "this year";
        case "all-time":
            return "of all time";
        case "custom":
            return customTimeFrameText(ds);
    }
}

function customTimeFrameText(ds: DateStrings) {
    if (ds.start == null && ds.end == null) return "of all time";
    else if (ds.start == null || ds.start == "") return "before " + ds.end;
    else if (ds.end == null || ds.end == "") return "after " + ds.start;
    else return `between ${ds.start} and ${ds.end}`;
}
