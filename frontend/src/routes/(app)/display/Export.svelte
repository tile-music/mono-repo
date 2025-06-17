<script lang="ts">
    import { arrangement } from "./arrangement.svelte";
    import { filters, generalOptions, filtersContext } from "./filters.svelte";
    import type { AggregatedSongs, SquareInfo } from "./arrangement.svelte";
    import { getHeadingText } from "./filters.svelte";
    import type { Profile } from "$shared/Profile";

    let { songs, profile }: {
        songs: AggregatedSongs;
        profile: Profile | null;
    } = $props();

    let canvas: HTMLCanvasElement;
    let exportImage: HTMLImageElement | null = $state(null);
    let status: "idle" | "configuring" | "exporting" | "error" | "done" = $state("idle");
    let exportError: string | null = $state(null);
    let orientation: "portrait" | "landscape" | "square" = $state("portrait");
    $inspect(orientation);

    function handleExportError(error: string) {
        console.error(error);
        exportError = error;
        status = "error";
    }

    // Poster and layout config
    let posterWidth = $derived.by(() => {
        switch (orientation) {
            case "portrait": return 18 * 300;
            case "landscape": return 24 * 300;
            case "square": return 20 * 300;
        }
    });
    let posterHeight = $derived.by(() => {
        switch (orientation) {
            case "portrait": return 24 * 300;
            case "landscape": return 18 * 300;
            case "square": return 20 * 300;
        }
    });
    const MARGIN = 200;
    const IMAGE_MARGIN = 30;
    const HEADER_FONT_SIZE = 200;
    const FOOTER_FONT_SIZE = 100;

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
        canvas.width = posterWidth;
        canvas.height = posterHeight;
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

        // draw header
        let headerHeight = MARGIN;
        if (generalOptions.headerOptions.showHeader) {
            if (!profile) {
                handleExportError("profile is not defined");
                return;
            }

            headerHeight += HEADER_FONT_SIZE + MARGIN;
            let headerTextOffset = MARGIN;

            // draw profile image with circle mask
            if (generalOptions.headerOptions.showAvatar) {
                headerHeight += HEADER_FONT_SIZE * 0.5;
                const radius = HEADER_FONT_SIZE * 0.75;

                const profileImage = new Image();
                profileImage.crossOrigin = "anonymous";
                profileImage.src = profile.avatar_url;

                await new Promise<void>((resolve, reject) => {
                    profileImage.onload = () => {
                        headerTextOffset += radius * 2 + MARGIN / 2;
                        context.save();
                        context.beginPath();
                        context.arc(
                            MARGIN + radius, MARGIN + radius,
                            radius, 0, Math.PI * 2
                        );
                        context.clip();
                        context.drawImage(
                            profileImage,
                            MARGIN, MARGIN, radius * 2, radius * 2
                        );
                        context.restore();
                        resolve();
                    };
                    profileImage.onerror = () => reject("failed to load profile image");
                });
            }


            context.fillStyle = "white";
            context.font = `${HEADER_FONT_SIZE}px Mattone`;
            context.fillText(
                getHeadingText(profile, generalOptions.headerOptions, filters, filtersContext),
                headerTextOffset, headerHeight / 2 + HEADER_FONT_SIZE / 2
            );
        }

        // draw squares
        for (let i = 0; i < arrangement.squares.list.length; i++) {
            const square = arrangement.squares.list[i];

            const squareCoords = squareToPosterCoords(
                square, arrangement.squares.width, arrangement.squares.height,
                headerHeight
            );

            context.drawImage(
                images[i],
                squareCoords.x + IMAGE_MARGIN / 2, squareCoords.y + IMAGE_MARGIN / 2,
                squareCoords.size - IMAGE_MARGIN, squareCoords.size - IMAGE_MARGIN
            );
        }

        // draw footer
        context.fillStyle = "white";
        context.font = `${FOOTER_FONT_SIZE}px Archivo`;
        context.textAlign = "right";
        context.fillText(
            `tile.music`,
            posterWidth - MARGIN, posterHeight - MARGIN
        );

        // display the rendered canvas as an image
        if (!exportImage) {
            handleExportError("export image element is not defined");
            return;
        }

        exportImage.src = canvas.toDataURL("image/jpeg");
        exportImage.width = posterWidth / 16;
        exportImage.height = posterHeight / 16;
        context.clearRect(0, 0, canvas.width, canvas.height);

        status = "done";
    }

    function squareToPosterCoords(
        square: SquareInfo, arrangementWidth: number, arrangementHeight: number,
        headerHeight: number
    ) {
        // compute available drawing area
        const footerHeight = FOOTER_FONT_SIZE + MARGIN * 2;
        const drawWidth = posterWidth - 2 * MARGIN;
        const drawHeight = posterHeight - headerHeight - footerHeight;

        // arrangement aspect ratio
        const arrangementAspect = arrangementWidth / arrangementHeight;
        const drawAspect = drawWidth / drawHeight;

        // fit arrangement into drawing area, preserving aspect ratio
        let scale: number, offsetX: number, offsetY: number;
        if (arrangementAspect > drawAspect) {
            // arrangement is wider than drawing area
            scale = drawWidth / arrangementWidth;
            offsetX = MARGIN;
            offsetY = headerHeight + (drawHeight - arrangementHeight * scale) / 2;
        } else {
            // arrangement is taller than drawing area
            scale = drawHeight / arrangementHeight;
            offsetX = MARGIN + (drawWidth - arrangementWidth * scale) / 2;
            offsetY = headerHeight
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
    onclick={() => { status = "configuring"; }}
    disabled={status !== "idle"}
>export</button>
{#if status !== "idle"}
    <div id="popup-container">
        <div id="popup">
            <h1>export display</h1>
            {#if status === "configuring"}
                <div class="input-group">
                    <label for="orientation">orientation</label>
                    <select
                        name="orientation" id="orientation"
                        bind:value={orientation}
                    >
                        <option value="portrait">portrait</option>
                        <option value="landscape">landscape</option>
                        <option value="square">square</option>
                    </select>
                </div>
                <button
                    class="art-display-button"
                    onclick={exportCanvas}
                >export</button>
            {:else if status === "exporting"}
                <p>exporting...</p>
            {:else if status === "error"}
                <p class="error">error: {exportError}</p>
            {:else if status === "done"}
                <p>export complete!</p>
            {/if}
            <img bind:this={exportImage} hidden={status !== "done"} src="" alt="">
            <button
                id="close"
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

    canvas {
        display: none;
    }

    #close {
        color: var(--accent);
        text-decoration: underline;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    select {
        background-color: var(--midground);
        border: 0;
        border-bottom: 2px solid var(--medium);
        font-family: "Archivo", sans-serif;
        font-size: 15px;
        padding:  2px; /* compensate for border */
        color: var(--text);
    }

    .input-group {
        display: flex;
        gap: 20px;
        align-items: center;
    }
</style>