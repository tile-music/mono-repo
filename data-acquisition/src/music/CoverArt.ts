import { Fireable } from "./Fireable.ts";
import { SupabaseClient } from "@supabase";
import type { FilterResponse } from "@munite";
import { Database } from "_shared/schema.ts";
import { log } from "../util/log.ts";

type CoverImage = {
    front: boolean;
    back: boolean;
    image: string;
    thumbnails?: {
        "1200"?: string;
    };
    approved?: boolean;
    types?: string[];
};

type CoverArtType =
    Extract<FilterResponse, { release: unknown }>["release"]["cover_art"];

type FireResult = { front?: string; back?: string };


type CloudflareImageResponse = {
    result: {
        id: string;
        filename: string;
        uploaded: string;
        requireSignedURLs: boolean;
        variants: string[];
    };
    success: boolean;
    errors: unknown[];
    messages: unknown[];
};

export class CoverArt {
    constructor(
        private releaseId: string,
        private supabase: SupabaseClient<Database>,
        private coverArt: CoverArtType,
    ) {}

    private pickBestUrl(img: CoverImage): string {
        if (img.thumbnails?.["1200"]) return img.thumbnails["1200"];
        if (img.image) return img.image;
        throw new Error("No usable image URL");
    }

    private selectImages(images: CoverImage[]) {
        const front =
            images.find((i) => i.front && i.approved) ??
            images.find((i) => i.front) ??
            images.find((i) => i.types?.includes("Front"));

        const back =
            images.find((i) => i.back && i.approved) ??
            images.find((i) => i.back) ??
            images.find((i) => i.types?.includes("Back"));

        return { front, back };
    }

    private async ensureReleaseExists() {
        const now = new Date().toISOString();

        await this.supabase
            .from("mb_releases")
            .upsert({
                id: this.releaseId,
                created_at: now,
                updated_at: now,
            });
    }

    private async existingImages(): Promise<Set<string>> {
        const { data } = await this.supabase
            .from("mb_album_art")
            .select("image_type")
            .eq("release_id", this.releaseId);

        return new Set(data?.map((d) => d.image_type) ?? []);
    }

    private async storeImage(
        type: "front" | "back",
        url: string,
    ) {
        await this.supabase.from("mb_album_art").upsert({
            release_id: this.releaseId,
            image_type: type,
            image_url: url,
        });
    }

    public async fire(): Promise<FireResult> {
        if (!this.releaseId) return {};
        if (!this.coverArt?.artwork) return {};

        try {
            await this.ensureReleaseExists();

            const existing = await this.existingImages();

            if (existing.has("front") && existing.has("back")) {
                log(1, `Skipping ${this.releaseId}, already has art`);
                return {};
            }

            const res = await fetch(
                `https://coverartarchive.org/release/${this.releaseId}`,
                { headers: { Accept: "application/json" } },
            );

            if (res.status === 404) return {};
            if (!res.ok) {
                throw new Error(`CAA metadata fetch failed: ${res.status}`);
            }

            const data = await res.json();
            const images: CoverImage[] = data.images ?? [];

            if (!images.length) return {};

            const { front, back } = this.selectImages(images);

            const result: FireResult = {};

            await Promise.all([
                (async () => {
                    if (!front || existing.has("front")) return;

                    try {
                        const url = this.pickBestUrl(front);
                        const uploaded = await this.uploadToCloudflare(url, "front");

                        const full = uploaded.variants.find(v => v.endsWith("/public"))
                            ?? uploaded.variants[0];

                        await this.storeImage("front", full);
                        result.front = uploaded.id;
                    } catch (e) {
                        log(0, `Front failed (${this.releaseId}): ${e}`);
                    }
                })(),

                (async () => {
                    if (!back || existing.has("back")) return;

                    try {
                        const url = this.pickBestUrl(back);
                        const uploaded = await this.uploadToCloudflare(url, "back");

                        const full = uploaded.variants.find(v => v.endsWith("/public"))
                            ?? uploaded.variants[0];

                        await this.storeImage("back", full);
                        result.back = uploaded.id;
                    } catch (e) {
                        log(0, `Back failed (${this.releaseId}): ${e}`);
                    }
                })(),
            ]);

            return result;
        } catch (e) {
            log(0, `CoverArt fire failed (${this.releaseId}): ${e}`);
            return {};
        }
    }

    private async uploadToCloudflare(
        url: string,
        type: "front" | "back",
    ): Promise<{ id: string; variants: string[] }> {
        const form = new FormData();

        form.append("url", url);
        form.append(
            "metadata",
            JSON.stringify({
                releaseId: this.releaseId,
                type,
            }),
        );
        form.append("requireSignedURLs", "false");

        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${Deno.env.get("CF_ACCT")}/images/v1`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Deno.env.get("CF_IMAGES_TOKEN")}`,
                },
                body: form,
            },
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Cloudflare upload failed: ${text}`);
        }

        const json: CloudflareImageResponse = await res.json();

        if (!json.success) {
            throw new Error(JSON.stringify(json.errors));
        }

        return {
            id: json.result.id,
            variants: json.result.variants,
        };
    }
}
