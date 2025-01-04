<script lang="ts">
    import type { SongInfo } from "../../../../../lib/Song";
    type squareInfo = {
        x: number
        y: number
        size: number
    };

    export let square: squareInfo;
    export let song: SongInfo;

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

<div id="square" style={style}>
    <img src={song.albums[0].image} alt="">
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