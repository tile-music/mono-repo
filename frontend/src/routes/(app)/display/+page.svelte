<script lang="ts">
    import Square from './Square.svelte';
    import { rankSongs } from './display';

    import { generateFullArrangement } from './pack';

    import type { PageData } from './$types';
    export let data: PageData;

    const test = generateFullArrangement(1, 14, 18, 0.1, 0.2);

    const squares: { x: number, y: number, size: number}[] = [];
    for (const entry of test) {
        squares.push({ x: entry.x, y: entry.y, size: entry.width })
    }

    // let squares  = [
    //     { x: 0.36, y: 0.38, size: 0.24 },
    //     { x: 0.6, y: 0.36, size: 0.24 },
    //     { x: 0.42, y: 0.2, size: 0.18 },
    //     { x: 0.44, y: 0.62, size: 0.16 },
    //     { x: 0.22, y: 0.4, size: 0.14 },
    //     { x: 0.32, y: 0.62, size: 0.12 },
    //     { x: 0.6, y: 0.6, size: 0.12 },
    //     { x: 0.32, y: 0.28, size: 0.1 },
    //     { x: 0.6, y: 0.26, size: 0.1 },
    //     { x: 0.22, y: 0.54, size: 0.1 }
    // ];

    const result = rankSongs(data.songs);
</script>

<h1>Art Display</h1>
<div id="container">
    <div id="display">
        {#each squares as square, i}
            <Square square={square} song={result[i].song}/>
        {/each}
    </div>
</div>

<style>
    #container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #display {
        height: calc(100vh - 150px);
        aspect-ratio: 1 / 1;
        position: relative;
    }
</style>