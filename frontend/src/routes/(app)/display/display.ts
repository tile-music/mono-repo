import type { SongInfo } from "../song";

type RankOutput = {
    song: SongInfo,
    plays: number
}[];

/**
 * aggregates a list of songs based on their isrc and sorts them based on the number of listens
 * @param songs the list of songs listened to by the user
 * @returns a sorted list of objects containing the song and its number of listens
 */
export function rankSongs(songs: SongInfo[]): RankOutput {
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
    
    // translate isrc back into song
    const output: RankOutput = [];
    for (const isrc in ranks) {
        output.push({ song: isrcToSong[isrc], plays: ranks[isrc] });
    }

    // sort by number of plays in descending order
    output.sort((a, b) => { return b.plays - a.plays; });
    return output;
}