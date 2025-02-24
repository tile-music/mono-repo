<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
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
    #logout{
        margin-left:auto;

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