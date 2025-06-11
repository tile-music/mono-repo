<script lang="ts">
    import { arrangement } from "./arrangement.svelte";
    import { filters } from "./filters.svelte";
    import type { AggregatedSongs, Squares, SquareInfo } from "./arrangement.svelte";

    let { songs }: { songs: AggregatedSongs } = $props();
    let canvas: HTMLCanvasElement;
    let exportImage: HTMLImageElement | null = $state(null);
    let status: "idle" | "exporting" | "error" | "done" = $state("idle");
    let exportError: string | null = $state(null);

    function handleExportError(error: string) {
        console.error(error);
        exportError = error;
        status = "error";
    }

    // Poster and layout config
    const POSTER_WIDTH = 18 * 300;
    const POSTER_HEIGHT = 24 * 300;
    const MARGIN = 100;
    const HEADER_HEIGHT = 300;
    const FOOTER_HEIGHT = 200;
    const IMAGE_MARGIN = 30;

    async function exportCanvas() {
        status = "exporting";
        exportError = null;

        if (!canvas) {
            handleExportError("canvas element is not defined");
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            handleExportError("failed to get canvas context");
            return;
        }

        if (arrangement.squares.list.length > songs.length) {
            handleExportError("not enough song data for arrangement");
            return;
        }

        // prepare canvas
        canvas.width = POSTER_WIDTH;
        canvas.height = POSTER_HEIGHT;
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // load images
        const imagePromises: Promise<HTMLImageElement>[] = []
        let images: HTMLImageElement[] = [];
        try {
            for (let i = 0; i < arrangement.squares.list.length; i++) {
                const song = songs[i];

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = song.song.albums[0].image;

                imagePromises.push(new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(`failed to load image for song ${song.song.title}`);
                }));
            }

            images = await Promise.all(imagePromises);
        } catch (error) {
            handleExportError(error as string);
            return;
        }

        // draw squares
        for (let i = 0; i < arrangement.squares.list.length; i++) {
            const square = arrangement.squares.list[i];

            const squareCoords = squareToPosterCoords(
                square, arrangement.squares.width, arrangement.squares.height
            );

            context.drawImage(
                images[i],
                squareCoords.x + IMAGE_MARGIN / 2, squareCoords.y + IMAGE_MARGIN / 2,
                squareCoords.size - IMAGE_MARGIN, squareCoords.size - IMAGE_MARGIN
            );
        }

        // display the rendered canvas as an image
        if (!exportImage) {
            handleExportError("export image element is not defined");
            return;
        }

        exportImage.src = canvas.toDataURL("image/jpeg");
        context.clearRect(0, 0, canvas.width, canvas.height);

        status = "done";
    }

    function squareToPosterCoords(
        square: SquareInfo, arrangementWidth: number, arrangementHeight: number
    ) {
        // compute available drawing area
        const drawWidth = POSTER_WIDTH - 2 * MARGIN;
        const drawHeight = POSTER_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 2 * MARGIN;

        // arrangement aspect ratio
        const arrangementAspect = arrangementWidth / arrangementHeight;
        const drawAspect = drawWidth / drawHeight;

        // fit arrangement into drawing area, preserving aspect ratio
        let scale: number, offsetX: number, offsetY: number;
        if (arrangementAspect > drawAspect) {
            // arrangement is wider than drawing area
            scale = drawWidth / arrangementWidth;
            offsetX = MARGIN;
            offsetY = HEADER_HEIGHT + MARGIN + (drawHeight - arrangementHeight * scale) / 2;
        } else {
            // arrangement is taller than drawing area
            scale = drawHeight / arrangementHeight;
            offsetX = MARGIN + (drawWidth - arrangementWidth * scale) / 2;
            offsetY = HEADER_HEIGHT + MARGIN;
        }

        return {
            x: offsetX + square.x * scale,
            y: offsetY + square.y * scale,
            size: square.size * scale
        };
    }
</script>

<button
    class="art-display-button"
    onclick={exportCanvas}
    disabled={status !== "idle"}
>export</button>
{#if status !== "idle"}
    <div id="popup-container">
        <div id="popup">
            <h1>export display</h1>
            {#if status === "exporting"}
                <p>exporting...</p>
            {:else if status === "error"}
                <p class="error">error: {exportError}</p>
            {:else if status === "done"}
                <p>export complete!</p>
            {/if}
            <img bind:this={exportImage} hidden={status !== "done"} src="" alt="">
            <button
                class="art-display-button"
                onclick={() => {
                    status = "idle";
                    exportError = null;
                }}
            >close</button>
        </div>
    </div>
{/if}
<canvas bind:this={canvas}></canvas>

<style>
    #popup-container {
        z-index: 2;
        display: flex;
        position: absolute;
        inset: 0;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
    }

    #popup {
        background-color: var(--midground);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        gap: 20px;
    }

    p {
        margin: auto 0;
    }

    img {
        width: 360px;
        height: 480px;
    }

    canvas {
        display: none;
    }
</style>