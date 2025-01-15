export type TimeFrame = "this-week"
    | "this-month" | "year-to-date"
    | "this-year" | "all-time" | "custom";

export type DateStrings = {
    start: string | null;
    end: string | null;
};

export type ShowCellInfo = "never" | "on-hover" | "always";

export function timeFrameToText(tf: TimeFrame, ds: DateStrings) {
    switch (tf) {
        case "this-week": return "this week";
        case "this-month": return "this month";
        case "year-to-date": return "year to date";
        case "this-year": return "this year";
        case "all-time": return "of all time";
        case "custom": return customTimeFrameText(ds);
    }
}

function customTimeFrameText(ds: DateStrings) {
    if (ds.start == null && ds.end == null) return "of all time";
    else if (ds.start == null || ds.start == "") return "before " + ds.end;
    else if (ds.end == null || ds.end == "") return "after " + ds.start;
    else return `between ${ds.start} and ${ds.end}`;
}