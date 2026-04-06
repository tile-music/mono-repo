import {
    findBestRecordingMatch,
    levenshtein,
} from "../../../src/util/levenshtein.ts";

import { assertEquals, assertNotEquals, assert } from "@assert";
// Helper: apply a single random edit
function applySingleEdit(s: string): string {
    const ops = ["insert", "delete", "replace"] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];

    if (op === "insert") {
        const idx = Math.floor(Math.random() * (s.length + 1));
        const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        return s.slice(0, idx) + char + s.slice(idx);
    }

    if (op === "delete" && s.length > 0) {
        const idx = Math.floor(Math.random() * s.length);
        return s.slice(0, idx) + s.slice(idx + 1);
    }

    // replace
    if (s.length === 0) return "a";
    const idx = Math.floor(Math.random() * s.length);
    const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    return s.slice(0, idx) + char + s.slice(idx + 1);
}

// Helper: apply n edits
function applyNEdits(s: string, n: number): string {
    let result = s;
    for (let i = 0; i < n; i++) {
        result = applySingleEdit(result);
    }
    return result;
}

// Helper: random string
function randomString(len: number): string {
    return Array.from({ length: len }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26)),
    ).join("");
}
Deno.test("levenshtein alorithm tests", (t) => {
    // 1. Distance to itself is 0
    t.step("distance(x, x) === 0", () => {
        for (let i = 0; i < 100; i++) {
            const s = randomString(10);
            assertEquals(levenshtein(s, s), 0);
        }
    });

    // 2. Distance is never negative
    t.step("distance is non-negative", () => {
        for (let i = 0; i < 100; i++) {
            const a = randomString(10);
            const b = randomString(10);
            assert(levenshtein(a, b) >= 0);
        }
    });

    // 3. Single edit => distance 1
    t.step("single edit gives distance 1", () => {
        for (let i = 0; i < 100; i++) {
            const x = randomString(10);
            const y = applySingleEdit(x);
            assertEquals(levenshtein(x, y), 1);
        }
    });

    // 4. Changing one side changes distance by at most 1
    t.step("distance changes by at most 1 after single edit", () => {
        for (let i = 0; i < 100; i++) {
            const x = randomString(10);
            const y = randomString(10);
            const d = levenshtein(x, y);

            const yPrime = applySingleEdit(y);
            const dPrime = levenshtein(x, yPrime);

            assert(Math.abs(d - dPrime) <= 1);
        }
    });

    // 5. After n edits, distance <= n
    t.step("distance after n edits is at most n", () => {
        for (let i = 0; i < 100; i++) {
            const x = randomString(10);
            const n = Math.floor(Math.random() * 5);

            const y = applyNEdits(x, n);
            const d = levenshtein(x, y);

            assert(d <= n);
        }
    });

    // 6. Symmetry: d(x, y) === d(y, x)
    t.step("symmetry", () => {
        for (let i = 0; i < 100; i++) {
            const a = randomString(10);
            const b = randomString(10);

            assertEquals(levenshtein(a, b), levenshtein(b, a));
        }
    });

    // 7. Optional: compare against a simple reference implementation
    function referenceLevenshtein(a: string, b: string): number {
        const dp = Array.from({ length: a.length + 1 }, () =>
            new Array(b.length + 1).fill(0),
        );

        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // delete
                    dp[i][j - 1] + 1, // insert
                    dp[i - 1][j - 1] + cost, // substitute
                );
            }
        }

        return dp[a.length][b.length];
    }

    t.step("matches reference implementation", () => {
        for (let i = 0; i < 100; i++) {
            const a = randomString(10);
            const b = randomString(10);

            assertEquals(levenshtein(a, b), referenceLevenshtein(a, b));
        }
    });
});

Deno.test("matches case-insensitive titles", () => {
    const recordings = [{ id: "1", title: "Through the Wire" }];

    const result = findBestRecordingMatch("Through The Wire", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes 'feat.' and matches correctly", () => {
    const recordings = [{ id: "1", title: "SICKO MODE" }];

    const result = findBestRecordingMatch("SICKO MODE feat. Drake", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes dash suffix like remastered", () => {
    const recordings = [{ id: "1", title: "Come Together" }];

    const result = findBestRecordingMatch(
        "Come Together - Remastered 2009",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes brackets and matches", () => {
    const recordings = [{ id: "1", title: "Numb" }];

    const result = findBestRecordingMatch("Numb [Live]", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("ignores punctuation differences", () => {
    const recordings = [{ id: "1", title: "Don't Stop Believin'" }];

    const result = findBestRecordingMatch("Dont Stop Believin", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("returns null when below similarity threshold", () => {
    const recordings = [{ id: "1", title: "Bohemian Rhapsody" }];

    const result = findBestRecordingMatch(
        "Completely Different Song",
        recordings,
    );

    assertEquals(result, null);
});

Deno.test("selects best match among multiple candidates", () => {
    const recordings = [
        { id: "1", title: "Hello" },
        { id: "2", title: "Hello (Live)" },
        { id: "3", title: "Goodbye" },
    ];

    const result = findBestRecordingMatch("Hello", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("handles empty recordings array", () => {
    const result = findBestRecordingMatch("Hello", []);
    assertEquals(result, null);
});

Deno.test("handles identical strings perfectly", () => {
    const recordings = [{ id: "1", title: "Lose Yourself" }];

    const result = findBestRecordingMatch("Lose Yourself", recordings);

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});
