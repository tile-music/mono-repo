import type { SongInfo } from '../../../../../lib/Song';

export type ProcessOutput = SongInfo & {
    repetitions: number,
    plays: number
};

/**
 * 
 * @param songs a list of songs listened to by the user
 * @returns the processed list of songs with repetitions and number of plays
 */
export function processSongs(songs: SongInfo[]): ProcessOutput[] {
    // tabulate number of listens based on song isrc
    const ranks: { [x: string]: number } = {};
    const isrcToSong: { [x: string]: SongInfo } = {}
    for (const song of songs) {
        if (!ranks[song.isrc]) {
            ranks[song.isrc] = 1;
            isrcToSong[song.isrc] = song;
        } else {
            ranks[song.isrc]++;
        }
    }

    // sort songs by time listened
    songs.sort((a, b) => { return b.listened_at - a.listened_at});

    // if user played the same song multiple times in a row,
    // collapse into one entry and record repetitions
    const output: ProcessOutput[] = []
    let prev_isrc = "";
    for (const song of songs) {
        if (song.isrc !== prev_isrc) {
            output.push({
                ...song,
                repetitions: 1,
                plays: ranks[song.isrc]
            });
            prev_isrc = song.isrc;
        } else {
            output[output.length - 1].repetitions++;
        }
    }

    return output;
}