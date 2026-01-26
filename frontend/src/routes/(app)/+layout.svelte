<script lang="ts">
    import { page } from "$app/state";
    import type { LayoutData } from "./$types";

    import type { Snippet } from "svelte";
    import Logo from "$lib/components/Logo.svelte";
    import Avatar from "$lib/components/Avatar.svelte";

    interface Props {
        children?: Snippet;
        data: LayoutData;
    }

    const { children, data }: Props = $props();
    const { title } = $derived(page.data);
    const { profile } = $derived(data);

    let popover: HTMLDivElement;
    let popoverVisible = $state(false);

    function handleClick(e: MouseEvent) {
        if (popover && !popover.contains(e.target as Node)) {
            popoverVisible = false;
        }
    }
</script>

<div id="container">
    <nav>
        <a href="/studio"><Logo badge size="50px" /></a>
        <h1>{title ?? "Default title"}</h1>
        <button
            onclick={(e) => {
                e.stopPropagation();
                popoverVisible = !popoverVisible;
            }}
        >
            <Avatar {profile} size={50} />
        </button>
        <div bind:this={popover} id="popover" class:visible={popoverVisible}>
            <section id="details">
                <Avatar {profile} size={50} />
                <div>
                    <p><strong>{profile.full_name}</strong></p>
                    <p>{profile.username}</p>
                    <p>{profile.website}</p>
                </div>
            </section>
            <ul>
                <li><a href="/studio">Studio</a></li>
                <li><a href="/listening">Listening Data</a></li>
                <li><a href="/profile">Profile</a></li>
                <li>
                    <a href="/logout" data-sveltekit-preload-data="off">
                        Log Out
                    </a>
                </li>
            </ul>
        </div>
    </nav>
    <div class="content">
        {@render children?.()}
    </div>
</div>

<svelte:document onclick={handleClick} />

<svelte:head>
    <title>{title ? "tile.music | " + title : "tile.music"}</title>
</svelte:head>

<style>
    #container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    nav {
        display: flex;
        gap: 1em;
        justify-content: flex-start;
        align-items: center;
        padding: 1em 1em 0 1em;
        position: relative;

        h1 {
            margin: 0;
        }

        & > button {
            background: none;
            border: none;
            margin: 0;
            margin-left: auto;
            padding: 0;
        }

        #popover {
            position: absolute;
            right: 1em;
            background-color: var(--bg-subtle);
            border: 1px solid var(--border);
            border-radius: 5px;
            bottom: -0.5rem;
            transform: translateY(100%);
            display: none;
            padding: 0.5em;

            &.visible {
                display: flex;
                flex-direction: column;
                gap: 0.5em;
            }

            #details {
                display: flex;
                gap: 0.5em;
                align-items: center;

                div {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25em;

                    p {
                        margin: 0;
                    }
                }
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 0.25em;
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
        }
    }

    .content {
        margin: 1em;
        flex-grow: 1;
        min-height: 0;
    }

    :global {
        body {
            height: 100%;
        }
    }
</style>
