<script lang="ts">
    import '$lib/assets/stylesheets/reset.css';
    import '$lib/assets/stylesheets/theme-dark.css';
    import '$lib/assets/stylesheets/global.css';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

{@render children?.()}