<script lang="ts">
  import Square from "./Square.svelte";
  import { rankSongs } from "./display";

  import { generateFullArrangement } from "./pack";

  import type { PageData } from "./$types";
  import {toPng} from 'html-to-image'
  export let data: PageData;

  let artDisplayRef:any;

  async function captureDiv() {
        try {
            // Capture the div as an image
            const dataUrl = await toPng(artDisplayRef);
            
            // Create a link and trigger download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'my-div-image.png';
            link.click();
        } catch (error) {
            console.error('Failed to capture div as image:', error);
        }
      }

  const makeSquares = (): { x: number; y: number; size: number }[] => {
    const arrangement = generateFullArrangement(1, 14, 18, 0.1, 0.2);

    // translate the output of arrangement into a form usable by the Square component
    const squares: { x: number; y: number; size: number }[] = [];
    for (const square of arrangement) {
      squares.push({ x: square.x, y: square.y, size: square.width });
    }

    // sort listened songs by times listened

    return squares;
  };

  let squares = makeSquares();
  $: squares = makeSquares();

  const result = rankSongs(data.songs);
  // generate 14-18 squares with a small range of offsets
</script>

<div id="container">
  <div id="display" bind:this={artDisplayRef} class="capture-area">
    {#each squares as square, i}
    <Square {square} song={result[i].song} />
    {/each}
  </div>
</div>
<footer>
  <div style="display: flex; gap: 20px; position: relative;">
    <button on:click={() => (squares = makeSquares())} id="regenerate">Regenerate</button>
    <button on:click={captureDiv}>Save Art Collage</button>
  </div>
  
</footer>

<style>
button {

    bottom: 20px;
    left: 20px;
    height: 40px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    color: var(--background);
    background-color: var(--accent);
    font-family: "Mattone", sans-serif;
    font-size: 15px;
    padding: 0 20px;
}

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
