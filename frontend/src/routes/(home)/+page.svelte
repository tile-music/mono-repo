<script lang="ts">
    import type { SquareInfo } from "../(app)/studio/arrangement";
    import MusicNote from "$lib/components/MusicNote.svelte";
    import { Input, Button, Field } from "$lib/ui";

    type Example = {
        descriptor: string;
        squares: SquareInfo[];
    };

    const examples: Example[] = [
        {
            descriptor: "word cloud",
            squares: [
                { x: 0.3, y: 0.0, size: 0.2 },
                { x: 0.0, y: 0.2, size: 0.5 },
                { x: 0.5, y: 0.1, size: 0.3 },
                { x: 0.5, y: 0.4, size: 0.4 },
                { x: 0.4, y: 0.7, size: 0.1 },
            ],
        },
        {
            descriptor: "podium",
            squares: [
                { x: 0.0, y: 0.0, size: 0.5 },
                { x: 0.5, y: 0.0, size: 0.5 },
                { x: 0.0, y: 0.5, size: 0.333 },
                { x: 0.333, y: 0.5, size: 0.333 },
                { x: 0.666, y: 0.5, size: 0.333 },
            ],
        },
        {
            descriptor: "banner",
            squares: [
                { x: 0.1, y: 0.1, size: 0.2, rotation: 10 },
                { x: 0.4, y: 0.13, size: 0.2, rotation: 0 },
                { x: 0.7, y: 0.1, size: 0.2, rotation: -10 },
                { x: 0.2, y: 0.5, size: 0.2, rotation: 5 },
                { x: 0.6, y: 0.5, size: 0.2, rotation: -5 },
            ],
        },
    ];

    let selectedExample = $state(0);

    $effect(() => {
        const interval = setInterval(() => {
            selectedExample = (selectedExample + 1) % examples.length;
        }, 3000);

        return () => clearInterval(interval);
    });

    function generateSquareStyle(square: SquareInfo) {
        return `
            left: ${square.x * 100}%;
            top: ${square.y * 100}%;
            width: ${square.size * 100}%;
            height: ${square.size * 100}%;
            transform: rotate(${square.rotation || 0}deg);
        `;
    }
</script>

<div id="content">
    <section>
        <div id="tagline">
            <h1>
                A <span id="descriptor"
                    >{examples[selectedExample].descriptor}</span
                > for your music
            </h1>
            <p>
                Track, explore, and share your unique taste in music freely and
                privately.
            </p>
        </div>
        <div id="squares">
            {#each examples[selectedExample].squares as square, i}
                <div
                    style={generateSquareStyle(square)}
                    class="square-container"
                >
                    <div class="square">
                        <MusicNote size="50%" color="var(--fg)" class="note" />
                    </div>
                </div>
            {/each}
        </div>
    </section>
    <section id="get-notified">
        <h1>Convinced?</h1>
        <p>
            Sign up for our mailing list to get notified when tile.music is
            live.
        </p>
        <div id="mailing-list">
            <h2>get notified</h2>
            <form action="https://formspree.io/f/xpwyljbd" method="POST">
                <Field row>
                    <label for="email">Email:</label>
                    <Input type="email" name="email" id="email" required />
                </Field>
                <Button type="submit">sign up</Button>
            </form>
            <p>We'll only email you once the app is ready — no spam, ever.</p>
        </div>
    </section>
    <section id="comments">
        <h1>Comments?</h1>
        <p>
            If you would like to contact us, or have features you would like to
            see, reach us at <a href="mailto:hi@tile.music">hi@tile.music</a>
        </p>
    </section>
    <div class="divider"></div>
    <section id="footer">
        <h2>tile.music</h2>
        <div id="footer-content">
            <p id="attributions">
                Created by <a href="https://www.linkedin.com/in/sam-randa"
                    >Sam Randa</a
                >
                and
                <a href="https://www.linkedin.com/in/ivy-bixler-65a57b297/"
                    >Ivy Bixler</a
                >
            </p>
            <div id="resources">
                <a href="https://github.com/tile-music/mono-repo">Code</a>
                <a href="mailto:hi@tile.music">Email</a>
            </div>
        </div>
    </section>
</div>

<style>
    h1,
    h2 {
        margin: 0;
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

    .square-container {
        position: absolute;
        transition:
            left 1s cubic-bezier(0.1, 0.4, 0.3, 1),
            top 1s cubic-bezier(0.1, 0.4, 0.3, 1),
            width 1s cubic-bezier(0.1, 0.4, 0.3, 1),
            height 1s cubic-bezier(0.1, 0.4, 0.3, 1),
            transform 1s cubic-bezier(0.1, 0.4, 0.3, 1);
    }

    .square {
        background-color: var(--bg-subtle);
        box-sizing: border-box;
        border-radius: 8px;
        border: 2px solid var(--fg);
        box-shadow: inset 0 0 12px 0 var(--bg);
        position: absolute;
        inset: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .art-display-button {
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
    }

    #mailing-list {
        display: flex;
        flex-direction: column;
        gap: 4rem;
        align-items: center;
        background-color: var(--bg-subtle);
        padding: 4rem 2rem;
        border-radius: 12px;
    }

    #mailing-list form {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    #mailing-list form div {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    #mailing-list h2 {
        font-size: 1.5rem;
    }

    #mailing-list p {
        max-width: 35ch;
        text-align: center;
    }

    #comments {
        margin: 4rem 0;
    }

    #comments p {
        max-width: 45ch;
        text-align: center;
    }

    .divider {
        height: 1px;
        width: 100%;
        background-color: var(--bg-subtle);
    }

    #footer {
        padding: 3rem 6rem 6rem 6rem;
        text-align: center;
        flex-direction: row;
        align-items: flex-start;
    }

    #footer-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    #footer h2 {
        margin-right: auto;
    }

    #attributions,
    #attributions a,
    #resources a {
        font-size: 0.9rem;
        color: var(--border);
    }

    #resources {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    :global(.note) {
        filter: drop-shadow(0 0 12px var(--bg));
    }
</style>
