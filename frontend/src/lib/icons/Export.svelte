<script lang="ts">
    interface Props {
        size?: number;
        color?: string;
    }

    const { size = 24, color }: Props = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color ? color : "currentColor"}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-right-from-line-icon lucide-arrow-right-from-line"
    ><path d="M3 5v14" /><path d="M21 12H7" /><path d="m15 18 6-6-6-6" /></svg
>
