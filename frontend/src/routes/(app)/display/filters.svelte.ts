// IMPORTS
import type { DisplayDataRequest } from "$shared/Request";
import type { Profile } from "$shared/Profile";

// STATE
export const filters: DisplayDataRequest = $state({
    aggregate: "album",
    num_cells: null,
    date: { start: null, end: null },
    rank_determinant: "listens",
});

export const filtersContext: FiltersContext = $state({
    timeFrame: "all-time",
    dateStrings: { start: null, end: null },
});

export const generalOptions: GeneralOptions = $state({
    showCellInfo: "on-hover",
    headerOptions: {
        showHeader: true,
        nameSource: "name",
        showAvatar: true,
    },
});

// TYPES AND FUNCTIONS
interface FiltersContext {
    timeFrame: TimeFrame;
    dateStrings: DateStrings;
}

interface GeneralOptions {
    showCellInfo: ShowCellInfo;
    headerOptions: HeaderOptions;
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

export type HeaderOptions = {
    showHeader: boolean;
    nameSource: "name" | "username";
    showAvatar: boolean;
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

export function getHeadingText(
    profile: Profile,
    headerOptions: HeaderOptions,
    filters: DisplayDataRequest,
    filtersContext: FiltersContext
) {
    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    function toTitleCase(str: string) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    const nameText =
        (headerOptions.nameSource == "name"
            ? profile.full_name
            : profile.username) + "'s";

    return toTitleCase(
        `${nameText} top ${filters.aggregate + "s"} ` +
        timeFrameToText(filtersContext.timeFrame, filtersContext.dateStrings)
    );
}
