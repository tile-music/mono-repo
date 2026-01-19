<script lang="ts">
    import "$lib/assets/stylesheets/normalize.css";
    import "$lib/assets/stylesheets/theme.css";
    import "$lib/assets/stylesheets/global.css";

    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
</script>

{@render children?.()}
