<script>
    import sample_collage from '$lib/assets/images/sample_collage.png'
</script>

<div class="content">
    <div class="left">
        <img src={sample_collage} alt="A sample album art collage.">
    </div>
    <div class="right">
        <slot></slot>
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
        width: 50%;
        display: flex;
        justify-content: right;
        align-items: center;
    }
    
    .right {
        width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        height: 150%;
        transform: rotate(8deg);
        opacity: 0.5;
    }
</style>