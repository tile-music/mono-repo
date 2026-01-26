<script lang="ts">
    import sample_collage from "$lib/assets/images/sample_collage.png";
    import LinkSpotify from "./Spotify.svelte";
    import DeleteUser from "../(app)/delete-account/delete.svelte";
</script>

<div class="content">
    <div class="left">
        <img src={sample_collage} alt="A sample album art collage." />
    </div>
    <div class="middle">
        <h1>One last thing...</h1>
        <LinkSpotify></LinkSpotify>
        <DeleteUser><a href="/">Cancel & delete account</a></DeleteUser>
    </div>
    <div class="right">
        <img src={sample_collage} alt="A second sample album art collage." />
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

    a {
        font-size: 16px;
    }

    .right {
        width: 30%;
        display: flex;
        justify-content: left;
        align-items: center;
    }

    .left img,
    .right img {
        height: 150%;
        transform: rotate(8deg);
        opacity: 0.5;
    }
</style>
