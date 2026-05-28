import { FilterResponse } from "@munite";
import { Track } from "./Track.ts";
import { Fireable } from "./Fireable.ts";
import { Database } from "../../../lib/schema.ts";
import { log } from "../util/log.ts";
import { SupabaseClient } from "@supabase";
import { findBestRecordingMatch } from "../util/levenshtein.ts";
type Entry = Database["public"]["Tables"]["mb_track_recordings"]["Insert"];

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
                } else {
                    log(
                        6,
                        `failed to find a suitable recording
                        Recordings: ${JSON.stringify(this.muniteResult.release.tracks, null, 2)}
                        Track: ${JSON.stringify(this.tracks, null, 2)}
                        `,
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
            log(
                6,
                `mb track recordings\n
                data: ${JSON.stringify(data, null, 2)}\n
                error: ${JSON.stringify(error, null, 2)}`,
            );
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
