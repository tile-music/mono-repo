<script lang="ts">
    export let url: string;
    export let size: number;
    // export let text_size: number;
    // export let content: string;
</script>

<div style="width: {size}; height: {size};">
    <img src={url} alt="">
</div>

<style>
    img {
        width: 150px;
        height: 100%;
        border-radius: 50%;
    }
</style>