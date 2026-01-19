<script lang="ts">
    import { page } from "$app/state";
    import type { LayoutData } from "./$types";
    import sampleAvatar from "$lib/assets/images/sample_avatar.jpg";

    import type { Snippet } from "svelte";
    import Logo from "$lib/components/Logo.svelte";

    interface Props {
        children?: Snippet;
        data: LayoutData;
    }

    const { children, data }: Props = $props();
    const { title } = $derived(page.data);
    const { profile } = $derived(data);

    let popover: HTMLDivElement;
    let popoverVisible = $state(false);

    function initials(name: string) {
        const words = name.split(" ").filter((part) => part.length > 0);
        const initialsArray = words.map((part) => part.charAt(0).toUpperCase());
        return initialsArray.join("");
    }

    function handleClick(e: MouseEvent) {
        if (popover && !popover.contains(e.target as Node)) {
            popoverVisible = false;
        }
    }
</script>

{#snippet profileIcon(size: string)}
    <div class="icon" style:--size={size}>
        {#if profile.username || profile.full_name}
            <span>{initials(profile.full_name ?? profile.username)}</span>
        {:else}
            <img src={sampleAvatar} alt="Generic user icon" />
        {/if}
    </div>
{/snippet}

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
            {@render profileIcon("50px")}
        </button>
        <div bind:this={popover} id="popover" class:visible={popoverVisible}>
            <section id="details">
                {@render profileIcon("50px")}
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
                <li><a href="/logout">Log Out</a></li>
            </ul>
        </div>
    </nav>
    <div class="content">
        {@render children?.()}
    </div>
</div>

<svelte:document onclick={handleClick} />

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
        padding: 1em;
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
            bottom: 0;
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

    .icon {
        border-radius: 50%;
        color: var(--fg);
        background-color: var(--bg-subtle);
        border: 1px solid var(--border);
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--size);
        height: var(--size);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        span {
            font-size: calc(var(--size) * 0.4);
        }
    }

    .content {
        margin: 20px;
        flex-grow: 1;
        min-height: 0;
    }
</style>
