<script lang="ts">
    import type { SquareInfo } from "../(app)/display/arrangement.svelte";

    import album0 from "./albums/album-0.jpg";
    import album1 from "./albums/album-1.jpg";
    import album2 from "./albums/album-2.jpg";
    import album3 from "./albums/album-3.jpg";
    import album4 from "./albums/album-4.jpg";

    const albums = [album0, album1, album2, album3, album4];
    
    type Example = {
        descriptor: string;
        squares: SquareInfo[];
    }

    const examples: Example[] = [
        {
            descriptor: "word cloud",
            squares: [
                { x: 0.3, y: 0.0, size: 0.2 },
                { x: 0.0, y: 0.2, size: 0.5 },
                { x: 0.5, y: 0.1, size: 0.3 },
                { x: 0.5, y: 0.4, size: 0.4 },
                { x: 0.4, y: 0.7, size: 0.1 }
            ]
        },
        {
            descriptor: "podium",
            squares: [
                { x: 0.0, y: 0.0, size: 0.5 },
                { x: 0.5, y: 0.0, size: 0.5 },
                { x: 0.0, y: 0.5, size: 0.333 },
                { x: 0.333, y: 0.5, size: 0.333 },
                { x: 0.666, y: 0.5, size: 0.333 }
            ]
        },
        {
            descriptor: "banner",
            squares: [
                { x: 0.1, y: 0.1, size: 0.2, rotation: 10 },
                { x: 0.4, y: 0.13, size: 0.2, rotation: 0 },
                { x: 0.7, y: 0.1, size: 0.2, rotation: -10 },
                { x: 0.2, y: 0.5, size: 0.2, rotation: 5 },
                { x: 0.6, y: 0.5, size: 0.2, rotation: -5 }
            ]
        }
    ];

    let selectedExample = $state(0);

    $effect(() => {
        const interval = setInterval(() => {
            selectedExample = (selectedExample + 1) % examples.length;
        }, 3000);

        return () => clearInterval(interval);
    });
</script>

<div id="content">
    <section>
        <div id="tagline">
            <h1>A <span id="descriptor">{examples[selectedExample].descriptor}</span> for your music</h1>
            <p>Track, explore, and share your unique taste in music freely and privately.</p>
        </div>
        <div id="squares">
            {#each examples[selectedExample].squares as square, i}
                <img
                    class="square"
                    style="left: {square.x * 100}%; top: {square.y * 100}%; width: {square.size * 100}%; height: {square.size * 100}%; transform: rotate({square.rotation || 0}deg);"
                    src={albums[i % albums.length]}
                    alt={`Example album cover ${i + 1}`}
                />
            {/each}
        </div>
    </section>
    <section>
        <h2>Mix and match streaming platforms and sources for a complete listening history.</h2>
        <ul id="roulette">
            <li>Spotify</li>
            <li>Apple Music</li>
            <li>Last.fm</li>
            <li>Physical media</li>
    </section>
    <section>
        <h2>Theme your cover art just how you like it.</h2>
        <div id="themes"></div>
    </section>
    <section>
        <h1>Convinced?</h1>
    </section>

</div>

<style>
    #content {
        padding: 1rem;
    }

    #tagline {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    section {
        display: flex;
        flex-direction: column;
        gap: 4rem;
        align-items: center;
    }

    #descriptor {
        font-weight: bold;
        border-bottom: 4px solid var(--accent);
        border-radius: 4px;
    }

    #squares {
        position: relative;
        aspect-ratio: 1;
        width: 100%;
        max-width: 600px;
    }

    .square {
        position: absolute;
        background-color: white;
        transition:
            left 1s cubic-bezier(.1,.4,.3,1),
            top 1s cubic-bezier(.1,.4,.3,1),
            width 1s cubic-bezier(.1,.4,.3,1),
            height 1s cubic-bezier(.1,.4,.3,1),
            transform 1s cubic-bezier(.1,.4,.3,1);
        box-sizing: border-box;
        border: 2px solid var(--background);
    }

    #roulette {
        list-style-type: none;
        padding: 0;
    }

    #roulette li {
        margin-bottom: 0.5rem;
    }
</style>