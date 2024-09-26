<script lang="ts">
    import sample_collage from '$lib/assets/images/sample_collage.png'
    import spotify_logo from '$lib/assets/images/spotify_logo.png'

    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    export let data: PageData;
    $: ({ supabase, session } = data);

    async function link_spotify() {
        if (session == null) {
            console.error("User does not have session.");
            goto("/login");
            return;
        }

        const headers = {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
        const { data, error } = await supabase.functions.invoke("spotify-login", headers)

        if (error) {
            // TODO: tell the user that the link failed and to try again
            throw Error(error)
        }

        console.log(data)
        window.location.href = data
    }
</script>

<div class="content">
    <div class="left">
        <img src={sample_collage} alt="A sample album art collage.">
    </div>
    <div class="middle">
        <h1>one last thing...</h1>
        <button class="link_spotify" on:click={link_spotify}>log in with Spotify<img class="spotify_logo" src={spotify_logo} alt="The Spotify logo."></button>
        <div>
            <a href="/">cancel & delete account</a>
        </div>
    </div>
    <div class="right">
        <img src={sample_collage} alt="A second sample album art collage.">
    </div>
</div>

<style>
    .content {
        width: 100%;
        height: 100vh;
        display: flex;
        overflow: hidden;
    }

    .left {
        width: 30%;
        display: flex;
        justify-content: right;
        align-items: center;
    }

    .middle {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 40%;
        gap: 100px;
    }

    h1 {
        font-size: 30px;
    }

    .middle div {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .link_spotify {
        border: none;
        cursor: pointer;
        color: var(--background);
        font-family: "Mattone", sans-serif;
        font-size: 15px;
        height: 50px;
        width: 300px;
        border-radius: 10px;
        background-color: #1DB954; /* spotify green */
    }

    .right {
        width: 30%;
        display: flex;
        justify-content: left;
        align-items: center;
    }

    .left img, .right img {
        height: 150%;
        transform: rotate(8deg);
        opacity: 0.5;
    }

    .spotify_logo {
        width: 30px;
        height: 30px;
    }

    button {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
</style>