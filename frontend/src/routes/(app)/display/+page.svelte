<script lang="ts">
  import Square from "./Square.svelte";
  import { rankSongs } from "./display";
  import type { RankSelection } from "./display";
  
  import { generateFullArrangement } from "./pack";
  
  import type { PageData } from "./$types";
  import { toPng } from "html-to-image";
  export let data: PageData;
  
  let artDisplayRef: any;
  let selection: RankSelection = "song";

  async function captureDiv() {
    try {
      // Capture the div as an image
      const dataUrl = await toPng(artDisplayRef);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "art-display.png";
      link.click();
    } catch (error) {
      console.error("Failed to capture div as image:", error);
    }
  }

  const makeSquares = (maxSquares: number): { x: number; y: number; size: number }[] => {
    // skip computation if no squares are being generated
    if (maxSquares == 0) return [];

    const max = Math.min(maxSquares, 15);
    const arrangement = generateFullArrangement(1, Math.max(max, 0), max, 0.0, 0.1);

    // translate the output of arrangement into a form usable by the Square component
    const squares: { x: number, y: number, size: number }[] = [];
    for (const square of arrangement) {
      squares.push({ x: square.x, y: square.y, size: square.width });
    }

    return squares;
  };


  // generate initial square arrangement and song ranking;
  // make them reactive to changes in ranking method
  $: ranking = rankSongs(data.songs, selection);
  $: squares = makeSquares(ranking.length);
</script>

<select bind:value={selection} class="art-display-button">
  <option value="song">Song</option>
  <option value="album">Album</option>
</select>

<div id="container">
  {#if squares.length > 0 }
    <div id="display" bind:this={artDisplayRef} class="capture-area">
      {#each squares as square, i}
        <Square {square} song={ranking[i].song} />
      {/each}
    </div>
  {:else}
    <div id="placeholder-display" bind:this={artDisplayRef} class="capture-area">
      <h1>No listening data!</h1>
      <p>To generate a display, <a href="/link-spotify">link your Spotify account</a> and listen to some music!</p>
    </div>
  {/if}
</div>
<div id="lower-btns" style="">
  <button on:click={() => (squares = makeSquares(ranking.length))} id="regenerate"
    class="art-display-button">Regenerate</button>
  <button on:click={captureDiv} class="art-display-button">Save Art Collage</button>
</div>

<style>
  #lower-btns {
    display: flex; 
    gap: 20px;
    position: absolute;
    bottom: 10px;

  }
  #container {
    width: 100%;
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #display {
    height: calc(100vh - 150px);
    aspect-ratio: 1 / 1;
    position: relative;
  }

  #placeholder-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  #placeholder-display p {
    width: 20em;
    text-align: center;
  }
</style>
