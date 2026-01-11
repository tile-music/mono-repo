<script lang="ts">
    interface Props {
        url: string;
        size: number; // export let text_size: number;
    }

    let { url, size }: Props = $props();
    
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