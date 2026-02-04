/*
 * Represents a listening data request, containing properties for pagination.
 */
export type ListeningDataRequest = {
    date: string; // YYYY-MM-DD
    order: "newest" | "oldest";
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

    // Extract form values
    const order = form.get("order");
    const dateRaw = form.get("date");
    const offsetRaw = form.get("offset");
    const limitRaw = form.get("limit");

    // Resolve order
    if (order === null) throw { order: "Order is required." };
    if (order !== "newest" && order !== "oldest")
        throw { order: "Order must be 'newest' or 'oldest'." };

    // Resolve date
    let date =
        order === "newest"
            ? new Date().toISOString().slice(0, 10)
            : "1970-01-01";
    const datePattern = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    if (typeof dateRaw === "string" && datePattern.test(dateRaw)) {
        date = dateRaw;
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
        order,
        date,
        offset,
        limit,
    };
}
