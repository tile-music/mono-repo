<script>
    import { redirect } from '@sveltejs/kit';

    export let data;
    $: ({ supabase } = data);

    $: logout = async () => {
		// const { error } = await supabase.auth.signOut();
		// if (error) {
		// 	console.error(error);
		// }
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