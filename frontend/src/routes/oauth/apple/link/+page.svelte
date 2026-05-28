<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { Button } from "$lib/ui";
    import { goto } from "$app/navigation";

    interface Props {
        data: PageData;
    }

    const { data }: Props = $props();

    let status:
        | "idle"
        | "authorizing"
        | "failed"
        | "unsubscribed"
        | "finalizing"
        | "redirecting" = $state("idle");
    let error: string | null = $state(null);

    async function linkAppleMusic() {
        if (!MusicKit) return;

        status = "authorizing";
        const music = MusicKit.getInstance();
        let token: string;
        try {
            token = await music.authorize();
            console.log("Authorized:", token);
        } catch (e) {
            const err = e as { message: string };
            error = err.message;
            status = "failed";
            console.warn("Authorization failed:", err.message);
            return;
        }

        if (!music.isAuthorized || !music.api) {
            status = "unsubscribed";
            return;
        }

        status = "finalizing";

        const response = await fetch(window.location.href, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            status = "failed";
            error = "Failed to save user token.";
            return;
        }

        status = "redirecting";
        window.setTimeout(() => {
            goto("/studio");
        }, 2000);
    }

    onMount(async () => {
        if (!MusicKit) return;

        await MusicKit.configure({
            developerToken: data.token,
            app: {
                name: "tile.music",
                build: "0.1.0",
            },
        });
    });
</script>

<div class="container">
    <main>
        <h1>One more thing...</h1>
        <p>
            To track your listening data, link your Apple Music account.
            <i
                >Note that this will require an active Apple Music subscription.</i
            >
        </p>
        <Button
            onclick={linkAppleMusic}
            disabled={status === "authorizing" || status === "finalizing"}
            aria-label="Link Apple Music"
        >
            {status === "authorizing" ? "Authorizing..." : "Link Apple Music"}
        </Button>
        <section>
            {#if status === "finalizing"}
                <p>Finalizing Apple Music authorization...</p>
            {:else if status === "redirecting"}
                <p>Authorization successful, redirecting...</p>
            {:else if status === "failed"}
                <p>Failed to link Apple Music. Please try again.</p>
                <p>{error}</p>
            {:else if status === "unsubscribed"}
                <p>
                    tile.music requires an active Apple Music subscription to
                    use. You must subscribe to Apple Music or <a href="/logout">
                        Link a different streaming platform
                    </a>
                </p>
            {/if}
        </section>
    </main>
</div>

<svelte:head>
    <script
        src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
    ></script>
</svelte:head>

<style>
    .container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    main {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        width: 25rem;
        text-align: center;
    }
</style>
