import type { SongInfo } from "../song";

type RankOutput = {
    song: SongInfo,
    plays: number
}[];

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

    // sort by number of plays, descending
    output.sort((a, b) => { return a.plays - b.plays; });
    return output;
}