import { findBestRecordingMatch } from "../../../src/util/levenshtein.ts";

import {
    assertEquals,
    assertNotEquals,
} from "@assert";

Deno.test("matches reordered titles with parentheses", () => {
    const recordings = [
        { id: "1", title: "What Doesn’t Kill You (Stronger)" },
    ];

    const result = findBestRecordingMatch(
        "Stronger (What Doesn't Kill You)",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("matches case-insensitive titles", () => {
    const recordings = [
        { id: "1", title: "Through the Wire" },
    ];

    const result = findBestRecordingMatch(
        "Through The Wire",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes 'feat.' and matches correctly", () => {
    const recordings = [
        { id: "1", title: "SICKO MODE" },
    ];

    const result = findBestRecordingMatch(
        "SICKO MODE feat. Drake",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes dash suffix like remastered", () => {
    const recordings = [
        { id: "1", title: "Come Together" },
    ];

    const result = findBestRecordingMatch(
        "Come Together - Remastered 2009",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("removes brackets and matches", () => {
    const recordings = [
        { id: "1", title: "Numb" },
    ];

    const result = findBestRecordingMatch(
        "Numb [Live]",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("ignores punctuation differences", () => {
    const recordings = [
        { id: "1", title: "Don't Stop Believin'" },
    ];

    const result = findBestRecordingMatch(
        "Dont Stop Believin",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("returns null when below similarity threshold", () => {
    const recordings = [
        { id: "1", title: "Bohemian Rhapsody" },
    ];

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

    const result = findBestRecordingMatch(
        "Hello",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});

Deno.test("handles empty recordings array", () => {
    const result = findBestRecordingMatch("Hello", []);
    assertEquals(result, null);
});

Deno.test("handles identical strings perfectly", () => {
    const recordings = [
        { id: "1", title: "Lose Yourself" },
    ];

    const result = findBestRecordingMatch(
        "Lose Yourself",
        recordings,
    );

    assertNotEquals(result, null);
    assertEquals(result?.id, "1");
});
