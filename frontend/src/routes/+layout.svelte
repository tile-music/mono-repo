<script lang="ts">
    import '$lib/assets/stylesheets/reset.css';
    import "$lib/assets/stylesheets/theme-dark.css";
    import '$lib/assets/stylesheets/global.css';
    import { theme } from './theme';

    // $inspect(theme)
    
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<div class={$theme + "-theme"}>
   {@render children?.()} 
</div>
