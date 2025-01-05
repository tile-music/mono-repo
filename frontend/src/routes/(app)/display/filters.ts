export type TimeFrame = "this-week"
    | "this-month" | "year-to-date"
    | "this-year" | "all-time" | "custom";

export type DateStrings = {
    start: string | null;
    end: string | null;
};

export type ShowCellInfo = "never" | "on-hover" | "always";