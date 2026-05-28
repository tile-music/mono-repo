import { assert } from "jsr:@std/assert";
import { CoverArt } from "../../../src/music/CoverArt.ts";
import { supabase } from "../supabase.ts";

const TEST_CASES = [
    {
        name: "SCARING THE HOES",
        release: "578567d7-0e53-4d57-b7eb-78b2821858ba",
        coverArt: {
            front: true,
            back: false,
            darkened: false,
            artwork: true,
            count: 1,
        },
    },
    {
        name: "M.I.A. - MAYA",
        release: "2e0b79e5-7ece-4899-9f90-732fda5bbfec",
        coverArt: {
            back: false,
            darkened: false,
            count: 1,
            front: true,
            artwork: true,
        },
    },
    {
        name: "Heaven or Las Vegas",
        release: "a2661deb-a790-4bfb-b6b9-c57e1cb65baf",
        coverArt: {
            front: true,
            artwork: true,
            back: false,
            darkened: false,
            count: 1,
        },
    },
];
Deno.test("E2E: CoverArt uploads + persists", async () => {
    for (const test of TEST_CASES) {
        // Ensure release exists
        await supabase.from("mb_releases").upsert({
            id: test.release,
            created_at: new Date().toISOString(),
        });

        const cover = new CoverArt(
            test.release,
            supabase,
            test.coverArt,
        );

        const result = await cover.fire();

        console.log(test.name, result);

        // Validate DB state
        const { data } = await supabase
            .from("mb_album_art")
            .select("*")
            .eq("release_id", test.release);

        assert(data && data.length >= 1, "No images stored");

        const front = data.find((d) => d.image_type === "front");

        assert(front, `Missing front image for ${test.name}`);
        assert(
            front.image_url.includes("imagedelivery.net"),
            "Invalid Cloudflare URL",
        );

        console.log(`✅ ${test.name}`);
    }
});
