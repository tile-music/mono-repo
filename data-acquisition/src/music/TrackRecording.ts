import { FilterResponse } from "@munite";
import { Track } from "./Track.ts";
import { Fireable } from "./Fireable.ts";
import { Database } from "../../../lib/schema.ts";
import { log } from "../util/log.ts";
import { SupabaseClient } from "@supabase";
type Entry = Database["public"]["Tables"]["mb_track_recordings"]["Insert"];

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
function findBestRecordingMatch(
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

    return bestScore > 0.7 ? best : null; // threshold
}

/**
 * Persists track-to-recording mappings for matched releases.
 */
export class TrackRecording implements Fireable {
    private entries: Entry[] = [];

    /**
     * @param tracks Album tracks to map.
     * @param muniteResult Munite lookup result.
     * @param supabase Database client.
     */
    constructor(
        private tracks: Track[],
        private muniteResult: FilterResponse,
        private supabase: SupabaseClient<Database>,
    ) {}

    /**
     * Builds and upserts recording mappings for matched tracks.
     */
    public async fire(): Promise<void> {
        if (this.muniteResult.status === "success") {
            let tracksMatched = 0;
            for (const track of this.tracks) {
                const recording = findBestRecordingMatch(
                    track.getTitle(),
                    this.muniteResult.release.tracks ?? [],
                );

                if (recording) {
                    tracksMatched += 1;

                    this.entries.push(
                        this.makeDbEntryObject(
                            recording.id,
                            await track.getTrackDbID(),
                            this.muniteResult.release.id,
                        ),
                    );
                }
            }
            if (tracksMatched < this.tracks.length)
                log(
                    0,
                    `fewer tracks(mb recordings) matched than there are tracks(service) refine logic \n
                ${JSON.stringify(this)}`,
                );
            const { data, error } = await this.supabase
                .from("mb_track_recordings")
                .upsert(this.entries, { ignoreDuplicates: true })
                .select();
            log(6, `mb track recordings\n
                data: ${JSON.stringify(data, null, 2)}\n
                error: ${JSON.stringify(error, null,2)}`)
        }
    }

    /**
     * Builds the insert payload for `mb_track_recordings`.
     */
    private makeDbEntryObject(
        recordingId: string,
        trackId: string,
        releaseId: string,
    ): Entry {
        const date = new Date();
        return {
            id: recordingId,
            release_id: releaseId,
            track_id: trackId,
            created_at: date.toISOString(),
        };
    }
}

// public async getRecordings(): Promise<Recording[]> {
//     const recordings = await this.track.getRecordings();
//     return recordings;
// }
