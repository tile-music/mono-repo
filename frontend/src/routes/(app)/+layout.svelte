<script>
    import { redirect } from '@sveltejs/kit';

    $: logout = async () => {
        console.log(redirect(302, "/login"));
	};
</script>

<div id="container">
    <nav>
        <ul>
            <li id="display"><a href="/display">art display</a></li>
            <li id="listening"><a href="/listening">listening data</a></li>
            <li id="profile"><a href="/profile">profile</a></li>
            <li id="logout"><a href="/logout">logout</a></li>
        </ul>
    </nav>
    <div class="content">
        <slot></slot>
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