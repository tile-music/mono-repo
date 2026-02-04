<script lang="ts">
    import sample_collage from "$lib/assets/images/sample_collage.png";
    import type { Snippet } from "svelte";
    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="content">
    <div class="left">
        <img src={sample_collage} alt="A sample album art collage." />
    </div>
    <div class="right">
        {@render children()}
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

    @media (max-width: 700px) {
        .left {
            display: none;
        }

        .right {
            width: 100%;
        }
    }
</style>
