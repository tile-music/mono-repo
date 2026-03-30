import { log } from "./log.ts";

/**
 * all these functions were shatted and chatted
 */

/**
 * Normalizes titles before fuzzy matching.
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/\(.*?\)/g, "") // remove parentheses
        .replace(/\[.*?\]/g, "") // remove brackets
        .replace(/feat\.?.*/g, "")
        .replace(/-.*$/g, "") // remove suffixes like "- remastered"
        .replace(/[^\w\s]/g, "")
        .trim();
}

/**
 * Computes Levenshtein edit distance between two strings.
 */
function levenshtein(a: string, b: string): number {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);

    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            matrix[i][j] =
                b[i - 1] === a[j - 1]
                    ? matrix[i - 1][j - 1]
                    : Math.min(
                          matrix[i - 1][j - 1] + 1,
                          matrix[i][j - 1] + 1,
                          matrix[i - 1][j] + 1,
                      );
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Returns a normalized similarity score between 0 and 1.
 */
function similarity(a: string, b: string): number {
    const dist = levenshtein(a, b);
    return 1 - dist / Math.max(a.length, b.length);
}

/**
 * Finds the best recording title match above the configured threshold.
 */
export function findBestRecordingMatch(
    trackTitle: string,
    recordings: { id: string; title: string }[],
) {
    const normalizedTrack = normalizeTitle(trackTitle);

    let best = null;
    let bestScore = 0;

    for (const rec of recordings) {
        const normalizedRec = normalizeTitle(rec.title);
        const score = similarity(normalizedTrack, normalizedRec);

        if (score > bestScore) {
            bestScore = score;
            best = rec;
        }
    }

    log(6, `best recording ${best} Track title ${trackTitle}`)


    return bestScore > 0.7 ? best : null; // threshold
}
