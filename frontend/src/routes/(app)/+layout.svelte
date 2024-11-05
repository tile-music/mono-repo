<script>
    import { redirect } from '@sveltejs/kit';

    $: logout = async () => {
        console.log(redirect(302, "/login"));
	};
</script>

<div>
    <nav>
        <ul>
            <li><a href="/display">art display</a></li>
            <li><a href="/listening">listening data</a></li>
            <li><a href="/profile">profile</a></li>
            <li><a href="/logout">logout</a></li>
        </ul>
    </nav>
    <div class="content">
        <slot></slot>
    </div>
</div>

<style>

    nav {
        top:0;
        position:sticky;
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
    }
</style>