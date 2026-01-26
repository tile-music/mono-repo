<script lang="ts">
    import type { AlbumInfo, SongInfo } from "$shared/Song";
    import { getDisplayState } from "./displayState";
    import type { SquareInfo, Squares } from "./arrangement";
    const displayState = getDisplayState();
    const options = $derived(displayState.options);
    const filters = $derived(displayState.filters);

    interface Props {
        square: SquareInfo;
        song: SongInfo;
        quantity: number;
        context: Squares;
        rank: number;
        selectAlbum: (a: AlbumInfo, q: number, r: number) => void;
    }

    let { square, song, quantity, context, rank, selectAlbum }: Props =
        $props();

    let cellInfoClass = $derived(
        options.showCellInfo == "on-hover" ? "show-on-hover" : "",
    );

    let squareWidth: number = $state(0);
    let fontSize = $derived(0.08 * squareWidth + "px");

    function toHoursAndMinutes(ms: number) {
        const hours = Math.floor(ms / 1000 / 60 / 60);
        const minutes = Math.floor((ms / 1000 / 60 / 60 - hours) * 60);
        return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    function percent(decimal: number) {
        return 100 * decimal + "%";
    }

    let style = $derived(`
        left: ${percent(square.x / context.width)};
        top: ${percent(square.y / context.height)};
        width: ${percent(square.size / context.width)};
        height: ${percent(square.size / context.height)};
    `);
</script>

<button
    id="square"
    {style}
    bind:clientWidth={squareWidth}
    onclick={() => selectAlbum(song.albums[0], quantity, rank)}
    tabindex={rank}
>
    <img src={song.albums[0].image} alt="" />
    {#if options.showCellInfo != "never"}
        <div
            id="cell-info"
            class={cellInfoClass}
            style={`font-size: ${fontSize}`}
        >
            <p id="title">
                {filters.aggregate == "song"
                    ? song.title
                    : song.albums[0].title}
            </p>
            <p id="artist">{song.artists.join(", ")}</p>
            {#if filters.rank_determinant == "listens"}
                <p id="rank">
                    {quantity == 1 ? "1 listen" : quantity + " listens"} (#{rank})
                </p>
            {:else}
                <p id="rank">
                    {toHoursAndMinutes(quantity)} listened (#{rank})
                </p>
            {/if}
        </div>
    {/if}
</button>

<style>
    #square {
        z-index: 0;
        position: absolute;
        box-sizing: border-box;
        transition:
            transform ease-in 0.2s,
            z-index linear 0.2s;
        border: none;
        margin: 0;
        padding: 0;
        text-align: start;
    }

    #square:hover {
        z-index: 2;
        transform: scale(1.3);
        transition:
            transform ease-out 0.2s,
            z-index linear 0.2s;
    }

    #cell-info {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        background: linear-gradient(
            180deg,
            color(from var(--bg) srgb r g b / 0.5) 0%,
            rgba(0, 0, 0, 0) 50%
        );
        padding: 5%;

        p {
            margin: 0;
        }

        & > * {
            color: var(--fg);
            line-height: 1.15;
        }
    }

    #rank {
        margin-top: auto;
    }

    #square:not(:hover) .show-on-hover {
        display: none;
    }

    img {
        display: flex;
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
        object-fit: cover;
    }
</style>
