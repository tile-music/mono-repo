<script lang="ts">
    import type { SongInfo } from "../../../../../lib/Song";
    import type { DisplayDataRequest } from "../../../../../lib/Request";
    type squareInfo = {
        x: number
        y: number
        size: number
    };

    export let square: squareInfo;
    export let song: SongInfo;
    export let aggregate: DisplayDataRequest["aggregate"];
    export let rank_determinant: DisplayDataRequest["rank_determinant"];
    export let quantity: number;
    export let rank: number;
    export let showCellInfo: "never" | "on-hover" | "always";

    let cellInfoClass: string;
    $: cellInfoClass = showCellInfo == "on-hover" ? "show-on-hover" : "";

    let squareWidth: number = 0;
    let fontSize;
    $: fontSize = (0.08 * squareWidth) + "px";

    function toHoursAndMinutes(ms: number) {
        const hours = Math.floor(ms/1000/60/60);
        const minutes = Math.floor((ms/1000/60/60 - hours)*60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    function percent(decimal: number) {
        return 100*decimal + "%";
    }

    $: style = `
        left: ${percent(square.x)};
        top: ${percent(square.y)};
        width: ${percent(square.size)};
        height: ${percent(square.size)};
    `
</script>

<div id="square" style={style}
 bind:clientWidth={squareWidth}>
    <img src={song.albums[0].image} alt="">
    {#if showCellInfo != "never"}
        <div id="cell-info" class={cellInfoClass} style={`font-size: ${fontSize}`}>
            <p id="title">{aggregate == "song" ? song.title : song.albums[0].title}</p>
            <p id="artist">{song.artists.join(", ")}</p>
            {#if rank_determinant == "listens"}
                <p id="rank">{quantity} listens (#{rank})</p>
            {:else}
                <p id="rank">{toHoursAndMinutes(quantity)} listened (#{rank})</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    #square {
        z-index: 0;
        position: absolute;
        box-sizing: border-box;
        transition: transform ease-in 0.2s, z-index linear 0.2s;
    }

    #square:hover {
        z-index: 10;
        transform: scale(1.3);
        transition: transform ease-out 0.2s, z-index linear 0.2s;
    }

    #cell-info {
        position: absolute;
        top: 0;
        left: 0;
        width: 90%;
        height: 90%;
        display: flex;
        flex-direction: column;
        background: rgb(0,0,0);
        background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%);
        padding: 5%;
        gap: 1%;
    }

    #rank {
        margin-top: auto;
    }

    #square:not(:hover) .show-on-hover {
        display: none;
    }

    img {
        display: flex;
        justify-content: center;
        align-items: center;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        outline: 2px solid black;
        border: 1px solid black;
        object-fit: cover;
    }
</style>