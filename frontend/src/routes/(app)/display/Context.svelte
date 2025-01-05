<script lang="ts">
    import type { AlbumInfo } from "../../../../../lib/Song";
    import type { DisplayDataRequest } from "../../../../../lib/Request";
    import type { TimeFrame, DateStrings } from "./filters";

    // props
    export let album: AlbumInfo;
    export let quantity: number;
    export let rank: number;
    export let dateStrings: DateStrings;
    export let filters: DisplayDataRequest;
    export let timeFrame: TimeFrame;

    console.log(quantity);

    // computed state for metadata text
    $: artistsText = album.artists.length == 1 ? album.artists[0]
        : album.artists.slice(0, -1).join(", ") + " & " + album.artists[album.artists.length];

    $: altText = `Album art for ${album.title} by ${artistsText}`;

    $: rankText = `#${rank} most ${filters.rank_determinant == "time" ? "listened" : "played"} ` +
                  timeFrameToText(timeFrame, dateStrings);
    $: quantityText = filters.rank_determinant == "time" ?
                      toHoursAndMinutes(quantity) + " listened" :
                      quantity + " plays";
    
    export function timeFrameToText(tf: TimeFrame, ds: DateStrings) {
        switch (tf) {
            case "this-week": return "this week";
            case "this-month": return "this month";
            case "year-to-date": return "year to date";
            case "this-year": return "this year";
            case "all-time": return "of all time";
            case "custom": return customTimeFrameText(ds);
        }
    }

    function customTimeFrameText(ds: DateStrings) {
        if (ds.start == null && ds.end == null) return "of all time";
        else if (ds.start == null || ds.start == "") return "before " + ds.end;
        else if (ds.end == null || ds.end == "") return "after " + ds.start;
        else return `between ${ds.start} and ${ds.end}`;
    }

    function toHoursAndMinutes(ms: number) {
        const hours = Math.floor(ms/1000/60/60);
        const minutes = Math.floor((ms/1000/60/60 - hours)*60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
</script>

<div id="context-menu">
    <div id="metadata">
        <img src={album.image} alt={altText}>
        <div id="album-info">
            <h1 id="name">{album.title}</h1>
            <h2 id="artists">{artistsText}</h2>
            <p id="year">{album.release_year == null ? "Unknown release year" : album.release_year}</p>
            <p id="rank">{rankText} ({quantityText})</p>
        </div>
    </div>
</div>

<style>
    #context-menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 500px;
        height: 600px;
        padding: 10px;
        background-color: var(--midground);
    }

    #metadata {
        display: flex;
        width: 100%;
        gap: 10px;
    }

    #context-menu img {
        width: 40%;
        aspect-ratio: 1/1;
    }

    #album-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    #artists {
        margin-bottom: 15px;
    }
</style>