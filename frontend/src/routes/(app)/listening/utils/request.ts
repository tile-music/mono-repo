/*
 * Represents a listening data request, containing properties for pagination.
 */
export type ListeningDataRequest = {
    start_time_s: number;
    offset: number;
    limit: number;
};

/**
 * Verifies that a request body is a valid listening data request object.
 *
 * @param body An unknown request body
 */
export function validateListeningDataRequest(
    form: FormData,
): ListeningDataRequest {
    // Helper to parse integers safely
    const parseIntField = (value: FormDataEntryValue | null) => {
        if (value === null) return NaN;
        const num =
            typeof value === "string"
                ? Number.parseInt(value, 10)
                : Number(value);
        return Number.isFinite(num) ? num : NaN;
    };

    // Helper to parse epoch seconds
    const parseEpochSeconds = (value: FormDataEntryValue | null) => {
        if (value === null) return NaN;
        const num =
            typeof value === "string"
                ? Number.parseFloat(value)
                : Number(value);
        return Number.isFinite(num) ? num : NaN;
    };

    // Extract form values
    const startTimeRaw = form.get("start_time_s");
    const startDateRaw = form.get("start_date");
    const offsetRaw = form.get("offset");
    const limitRaw = form.get("limit");

    // Resolve start_time_s: prefer explicit start_time_s, else allow start_date (YYYY-MM-DD)
    let start_time_s: number;

    if (startTimeRaw !== null && String(startTimeRaw).trim() !== "") {
        const parsedStart = parseEpochSeconds(startTimeRaw);
        if (!Number.isFinite(parsedStart) || Number.isNaN(parsedStart)) {
            throw {
                start_time_s:
                    "Start time must be a valid number in epoch seconds.",
            };
        }
        if (parsedStart < 0) {
            throw {
                start_time_s: "Start time must be greater than or equal to 0.",
            };
        }
        // Accept fractional seconds but normalize to integer seconds
        start_time_s = Math.floor(parsedStart);
    } else if (startDateRaw !== null && String(startDateRaw).trim() !== "") {
        const dateStr = String(startDateRaw).trim();

        // Basic YYYY-MM-DD validation
        const yyyyMmDd = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateStr.match(yyyyMmDd);
        if (!match) {
            throw { start_date: "Invalid date format. Expected YYYY-MM-DD." };
        }

        // Date parsing: "YYYY-MM-DD" is interpreted as UTC by Date.parse in JS
        const ms = Date.parse(dateStr);
        if (!Number.isFinite(ms)) {
            throw { start_date: "Invalid date value." };
        }

        start_time_s = Math.floor(ms / 1000);
        if (start_time_s < 0) {
            throw { start_date: "Date must be on or after 1970-01-01." };
        }
    } else {
        throw { general: "Provide either start time or start date." };
    }

    // Resolve offset with default 0
    let offset = 0;
    if (offsetRaw !== null && String(offsetRaw).trim() !== "") {
        const parsedOffset = parseIntField(offsetRaw);
        if (!Number.isFinite(parsedOffset) || Number.isNaN(parsedOffset)) {
            throw { general: "Offset must be a valid integer." };
        }
        if (parsedOffset < 0) {
            throw { general: "Offset must be greater than or equal to 0." };
        }
        if (parsedOffset > 9999) {
            throw { general: "Offset must be less than or equal to 9999." };
        }
        offset = parsedOffset;
    }

    // Resolve limit with default 50
    let limit = 50;
    if (limitRaw !== null && String(limitRaw).trim() !== "") {
        const parsedLimit = parseIntField(limitRaw);
        if (!Number.isFinite(parsedLimit) || Number.isNaN(parsedLimit)) {
            throw { general: "Limit must be a valid integer." };
        }
        if (parsedLimit < 1) {
            throw { general: "Limit must be greater than or equal to 1." };
        }
        if (parsedLimit > 100) {
            throw { general: "Limit must be less than or equal to 100." };
        }
        limit = parsedLimit;
    }

    return {
        start_time_s,
        offset,
        limit,
    };
}
