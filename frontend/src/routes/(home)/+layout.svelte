<script lang="ts">
    import Logo from "$lib/components/Logo.svelte";
    
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<nav>
    <Logo 
        size="200px" 
        color="var(--text)" 
        class="nav-logo"
    />
    <a href="/register" class="art-display-button">get started</a>
</nav>
{@render children?.()}

<style>
    nav {
        padding: 2rem 2rem 0 2rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: var(--background);
        z-index: 1;
    }

    nav::after {
        content: '';
        position: absolute;
        bottom: -40px;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(to bottom, var(--background, #ffffff), transparent);
        pointer-events: none;
    }

    .art-display-button {
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
    }

    :global(.nav-logo) {
        margin-right: auto;
    }
</style>