<script lang="ts">
    import sample_collage from '$lib/assets/images/sample_collage.png'
    import LinkSpotify from './spotify.svelte'
</script>

<div class="content">
    <div class="left">
        <img src={sample_collage} alt="A sample album art collage.">
    </div>
    <div class="middle">
        <h1>one last thing...</h1>
        <LinkSpotify></LinkSpotify>
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

    
</style>