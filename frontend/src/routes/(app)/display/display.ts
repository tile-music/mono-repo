import type { SongInfo } from "../../../../../lib/Song";

type RankOutput = {
    song: SongInfo,
    plays: number
}[];

export type RankSelection = "song" | "album";

/**
 * aggregates a list of songs based on their isrc and sorts them based on the number of listens
 * @param songs the list of songs listened to by the user
 * @returns a sorted list of objects containing the song and its number of listens
 */
export function rankSongs(songs: SongInfo[], rankSelection: RankSelection): RankOutput {
    // return empty array if listening data is empty
    if (!songs || !songs.length) return [];

    // tabulate number of listens based on song isrc
    const ranks: { [x: string]: number } = {};
    const songRanking: { [x: string]: SongInfo } = {}
    for (const song of songs) {
        let rank: string;
        switch(rankSelection){
            case "song":
                rank = song.isrc;
                break;
            case "album":
                rank = song.albums[0].image;
                break
            default:
                throw new Error("Invalid RankSelection");
        }
        if (!ranks[rank]) {
            ranks[rank] = 1;
            songRanking[rank] = song;
        } else {
            ranks[rank]++;
        }
    }
    
    // translate isrc back into song
    const output: RankOutput = [];
    for (const rankMetric in ranks) {
        output.push({ song: songRanking[rankMetric], plays: ranks[rankMetric] });
    }

    // sort by number of plays in descending order
    output.sort((a, b) => { return b.plays - a.plays; });
    return output;
}