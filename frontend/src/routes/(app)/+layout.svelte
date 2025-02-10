<script lang="ts">
    import { redirect } from '@sveltejs/kit';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let logout = $derived(async () => {
        console.log(redirect(302, "/login"));
	});

    function setColors(color : string | null) {
        let html = document.querySelector('html');
        const root = document.documentElement;
        const styles = getComputedStyle(root);

        html?.style.setProperty("--background", styles.getPropertyValue('--background-' + color))
        html?.style.setProperty("--text", styles.getPropertyValue('--text-' + color))
        html?.style.setProperty("--medium", styles.getPropertyValue('--medium-'  + color))
        html?.style.setProperty("--midground", styles.getPropertyValue('--midground-'  + color))
        html?.style.setProperty("--accent", styles.getPropertyValue('--accent-' + color)) 
    }

    onMount(() => {
        if( browser && localStorage.getItem("theme") != null) {
            setColors(localStorage.getItem("theme"))
        }
	});
</script>

<div id="container">
    <nav>
        <ul>
            <li id="display"><a href="/display">art display</a></li>
            <li id="listening"><a href="/listening">listening data</a></li>
            <li id="profile"><a href="/profile">profile</a></li>
            <li id="logout" data-sveltekit-preload-data="off"><a href="/logout">logout</a></li>
        </ul>
    </nav>
    <div class="content">
        {@render children?.()}
    </div>
</div>

<style>
    #container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    nav {
        
        z-index: 2;
        margin: 20px;
    }

    ul {
        display: flex;
        gap: 20px;
    }

    a {
        text-decoration: none;
        font-family: "Mattone", sans-serif;
    }

    .content {
        margin: 20px;
        flex-grow: 1;
        min-height: 0;
    }
</style>