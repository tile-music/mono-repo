<script lang="ts">
    import type { AggregatedSongs, SquareInfo } from "./arrangement";
    import { getHeadingText } from "./displayState";
    import type { Profile } from "$shared/Profile";
    import { Button, Field, Input, Select } from "$lib/ui";

    import { getDisplayState } from "./displayState";
    import { getArrangement } from "./arrangement";

    const arrangement = getArrangement();
    const displayState = getDisplayState();
    const filters = $derived(displayState.filters);
    const context = $derived(displayState.context);
    const options = $derived(displayState.options);

    let {
        songs,
        profile,
        status = $bindable(),
    }: {
        songs: AggregatedSongs;
        profile: Profile | null;
        status: "idle" | "configuring" | "exporting" | "error" | "done";
    } = $props();

    let canvas: HTMLCanvasElement;
    let exportImage: HTMLImageElement | null = $state(null);
    let exportError: string | null = $state(null);
    let orientation: "portrait" | "landscape" | "square" = $state("portrait");
    let colors: "print-friendly" | "theme" = $state("print-friendly");

    function handleExportError(error: string) {
        console.error(error);
        exportError = error;
        status = "error";
    }

    // Poster and layout config
    let posterWidth = $derived.by(() => {
        switch (orientation) {
            case "portrait":
                return 18 * 300;
            case "landscape":
                return 24 * 300;
            case "square":
                return 20 * 300;
        }
    });
    let posterHeight = $derived.by(() => {
        switch (orientation) {
            case "portrait":
                return 24 * 300;
            case "landscape":
                return 18 * 300;
            case "square":
                return 20 * 300;
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

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            handleExportError("failed to get canvas context");
            return;
        }

        if (arrangement.squares.list.length > songs.length) {
            handleExportError("not enough song data for arrangement");
            return;
        }

        // prepare colors
        const backgroundColor =
            colors === "print-friendly"
                ? "#ffffff"
                : getComputedStyle(document.documentElement)
                      .getPropertyValue("--background")
                      .trim();
        const textColor =
            colors === "print-friendly"
                ? "#000000"
                : getComputedStyle(document.documentElement)
                      .getPropertyValue("--text")
                      .trim();

        // prepare canvas
        canvas.width = posterWidth;
        canvas.height = posterHeight;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // load images
        const imagePromises: Promise<HTMLImageElement>[] = [];
        let images: HTMLImageElement[] = [];
        try {
            for (let i = 0; i < arrangement.squares.list.length; i++) {
                const song = songs[i];

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = song.song.albums[0].image;

                imagePromises.push(
                    new Promise((resolve, reject) => {
                        img.onload = () => resolve(img);
                        img.onerror = () =>
                            reject(
                                `failed to load image for song ${song.song.title}`,
                            );
                    }),
                );
            }

            images = await Promise.all(imagePromises);
        } catch (error) {
            handleExportError(error as string);
            return;
        }

        // draw header
        let headerHeight = MARGIN;
        if (options.header.showHeader) {
            if (!profile) {
                handleExportError("profile is not defined");
                return;
            }

            headerHeight += HEADER_FONT_SIZE + MARGIN;
            let headerTextOffset = MARGIN;

            // draw profile image with circle mask
            if (options.header.showAvatar) {
                headerHeight += HEADER_FONT_SIZE * 0.5;
                const radius = HEADER_FONT_SIZE * 0.75;

                const profileImage = new Image();
                profileImage.crossOrigin = "anonymous";
                profileImage.src = profile.avatar_url;

                await new Promise<void>((resolve, reject) => {
                    profileImage.onload = () => {
                        headerTextOffset += radius * 2 + MARGIN / 2;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(
                            MARGIN + radius,
                            MARGIN + radius,
                            radius,
                            0,
                            Math.PI * 2,
                        );
                        ctx.clip();
                        ctx.drawImage(
                            profileImage,
                            MARGIN,
                            MARGIN,
                            radius * 2,
                            radius * 2,
                        );
                        ctx.restore();
                        resolve();
                    };
                    profileImage.onerror = () =>
                        reject("failed to load profile image");
                });
            }

            ctx.fillStyle = textColor;
            ctx.font = `${HEADER_FONT_SIZE}px Mattone`;
            ctx.fillText(
                getHeadingText(profile, options.header, filters, context),
                headerTextOffset,
                headerHeight / 2 + HEADER_FONT_SIZE / 2,
            );
        }

        // draw squares
        for (let i = 0; i < arrangement.squares.list.length; i++) {
            const square = arrangement.squares.list[i];

            const squareCoords = squareToPosterCoords(
                square,
                arrangement.squares.width,
                arrangement.squares.height,
                headerHeight,
            );

            ctx.drawImage(
                images[i],
                squareCoords.x + IMAGE_MARGIN / 2,
                squareCoords.y + IMAGE_MARGIN / 2,
                squareCoords.size - IMAGE_MARGIN,
                squareCoords.size - IMAGE_MARGIN,
            );
        }

        // draw footer
        ctx.fillStyle = textColor;
        ctx.font = `${FOOTER_FONT_SIZE}px Archivo`;
        ctx.textAlign = "right";
        ctx.fillText(`tile.music`, posterWidth - MARGIN, posterHeight - MARGIN);

        // display the rendered canvas as an image
        if (!exportImage) {
            handleExportError("export image element is not defined");
            return;
        }

        exportImage.src = canvas.toDataURL("image/jpeg");
        exportImage.width = posterWidth / 16;
        exportImage.height = posterHeight / 16;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        status = "done";
    }

    function squareToPosterCoords(
        square: SquareInfo,
        arrangementWidth: number,
        arrangementHeight: number,
        headerHeight: number,
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
            offsetY =
                headerHeight + (drawHeight - arrangementHeight * scale) / 2;
        } else {
            // arrangement is taller than drawing area
            scale = drawHeight / arrangementHeight;
            offsetX = MARGIN + (drawWidth - arrangementWidth * scale) / 2;
            offsetY = headerHeight;
        }

        return {
            x: offsetX + square.x * scale,
            y: offsetY + square.y * scale,
            size: square.size * scale,
        };
    }
</script>

<div id="popup-container" class:visible={status !== "idle"}>
    <div id="popup">
        <h1>Export display</h1>
        {#if status === "configuring"}
            <Field row>
                <label for="orientation">Orientation</label>
                <Select
                    name="orientation"
                    id="orientation"
                    bind:value={orientation}
                >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="square">Square</option>
                </Select>
            </Field>
            <Field row>
                <label for="printFriendlyColors">Print friendly colors</label>
                <Input
                    type="radio"
                    name="colors"
                    id="printFriendlyColors"
                    value="print-friendly"
                    bind:group={colors}
                />
            </Field>
            <Field row>
                <label for="themeColors">Theme colors</label>
                <Input
                    type="radio"
                    name="colors"
                    id="themeColors"
                    value="theme"
                    bind:group={colors}
                />
            </Field>
            <Button onclick={exportCanvas}>Export</Button>
        {:else if status === "exporting"}
            <p>Exporting...</p>
        {:else if status === "error"}
            <p class="error">Error: {exportError}</p>
        {:else if status === "done"}
            <p>Export complete!</p>
        {/if}
        <img bind:this={exportImage} hidden={status !== "done"} src="" alt="" />
        <Button
            variant="link"
            id="close"
            onclick={() => {
                status = "idle";
                exportError = null;
            }}
        >
            Close
        </Button>
    </div>
</div>

<canvas bind:this={canvas}></canvas>

<style>
    h1 {
        margin: 0;
    }

    #popup-container {
        z-index: 2;
        display: none;
        position: absolute;
        inset: 0;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);

        &.visible {
            display: flex;
        }
    }

    #popup {
        background-color: var(--bg-subtle);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        gap: 20px;
        border-radius: 5px;
    }

    p {
        margin: auto 0;
    }

    canvas {
        display: none;
    }
</style>
