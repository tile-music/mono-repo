import { log } from "./log.ts";

/**
 * Normalizes titles before fuzzy matching.
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[()]/g, "") // keep content, remove parentheses chars only
        .replace(/\[|\]/g, "") // remove brackets chars only
        .replace(/feat\.?.*/g, "")
        .replace(/-.*$/g, "") // remove suffixes like "- remastered"
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Splits a normalized title into tokens.
 */
function tokenize(title: string): string[] {
    return title.split(" ").filter(Boolean);
}

/**
 * Computes Jaccard similarity between two token arrays.
 * = intersection / union
 */
function jaccardSimilarity(aTokens: string[], bTokens: string[]): number {
    const aSet = new Set(aTokens);
    const bSet = new Set(bTokens);

    let intersection = 0;
    for (const token of aSet) {
        if (bSet.has(token)) {
            intersection++;
        }
    }

    const union = new Set([...aSet, ...bSet]).size;

    return union === 0 ? 0 : intersection / union;
}

/**
 * Computes Levenshtein edit distance between two strings.
 * (kept as a secondary signal for typos)
 */
export function levenshtein(a: string, b: string): number {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;

    const matrix = new Array<number[]>(bn + 1);
    for (let i = 0; i <= bn; ++i) {
        const row = (matrix[i] = new Array<number>(an + 1));
        row[0] = i;
    }

    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
        firstRow[j] = j;
    }

    for (let i = 1; i <= bn; ++i) {
        for (let j = 1; j <= an; ++j) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1], // substitution
                        matrix[i][j - 1],     // insertion
                        matrix[i - 1][j],     // deletion
                    ) + 1;
            }
        }
    }

    return matrix[bn][an];
}

/**
 * Returns normalized Levenshtein similarity (0–1).
 */
function levenshteinSimilarity(a: string, b: string): number {
    const dist = levenshtein(a, b);
    return 1 - dist / Math.max(a.length, b.length);
}

/**
 * Token-based similarity (primary signal).
 * Combines Jaccard (order-independent) with optional Levenshtein fallback.
 */
export function tokenSimilarity(a: string, b: string): number {
    const aTokens = tokenize(a);
    const bTokens = tokenize(b);

    const jaccard = jaccardSimilarity(aTokens, bTokens);

    // Optional: order-insensitive Levenshtein boost
    const sortedA = aTokens.slice().sort().join(" ");
    const sortedB = bTokens.slice().sort().join(" ");
    const lev = levenshteinSimilarity(sortedA, sortedB);

    // Weighted blend (tune as needed)
    return 0.8 * jaccard + 0.2 * lev;
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

        const score = tokenSimilarity(normalizedTrack, normalizedRec);

        if (score > bestScore) {
            bestScore = score;
            best = rec;
        }
    }

    log(
        6,
        `best recording ${JSON.stringify(best)} score=${bestScore} track="${trackTitle}"`,
    );

    return bestScore > 0.65 ? best : null; // slightly lower threshold works better with tokens
}
