<script lang="ts">
    import type { PageProps, SubmitFunction } from "./$types";
    import Song from "./Song.svelte";
    import { Field, ValidatedInput, Select } from "$lib/ui";
    import { enhance } from "$app/forms";
    import IntersectionObserver from "$lib/components/IntersectionObserver.svelte";

    const { data, form }: PageProps = $props();

    let limit = $state(50);

    let songs = $derived(data.songs);
    let status: "success" | "error" | "loading" | "exhausted" = $derived(
        data.status,
    );

    let formElement: HTMLFormElement;
    let offsetElement: HTMLInputElement;

    const handleSubmit: SubmitFunction = () => {
        status = "loading";

        return async ({ update }) => {
            await update({ reset: false, invalidateAll: false });

            if (form?.success) {
                if (form.songs.length == 0) {
                    status = "exhausted";
                } else {
                    songs = [...songs, ...form.songs];
                    // debounce timeout
                    setTimeout(() => (status = "success"), 500);
                }
            } else {
                status = "error";
            }
        };
    };

    function changeOffset(offset: number) {
        if (offsetElement) {
            offsetElement.value = offset.toString();
            formElement.requestSubmit();
        }
    }
</script>

<form method="POST" bind:this={formElement} use:enhance={handleSubmit}>
    <Field>
        <label id="order-group">
            <span>Order:</span>
            <Select
                name="order"
                id="order"
                onchange={() => {
                    changeOffset(0);
                    songs = [];
                }}
            >
                <option id="newest" value="newest">Newest</option>
                <option id="oldest" value="oldest">Oldest</option>
            </Select>
        </label>
    </Field>
    <Field>
        <label id="date-group">
            <span id="until">Until:</span>
            <span id="since">Since:</span>
            <ValidatedInput
                id="date"
                type="date"
                name="date"
                onchange={() => {
                    changeOffset(0);
                    songs = [];
                }}
                autocomplete="off"
            />
        </label>
    </Field>
    <input
        type="hidden"
        name="offset"
        bind:this={offsetElement}
        autocomplete="off"
    />
    <input type="hidden" name="limit" bind:value={limit} autocomplete="off" />
</form>
<section>
    {#each songs as song}
        <Song {song} />
    {/each}
    {#if status === "success"}
        <div id="observer">
            <IntersectionObserver
                onIntersect={() => {
                    changeOffset(parseInt(offsetElement.value) + limit);
                }}
            />
        </div>
    {:else if status === "loading"}
        <p>Loading more songs...</p>
    {:else if status === "exhausted"}
        <p>You've reached the end of your listening history!</p>
    {/if}
</section>

<style>
    form {
        display: flex;
        gap: 1em;
        margin-bottom: 1em;

        label {
            display: flex;
            gap: 0.5em;
            align-items: center;
        }

        &:has(#newest:checked) #date-group {
            #until {
                display: inline;
            }

            #since {
                display: none;
            }
        }
    }

    section {
        padding-bottom: 1rem;
    }

    #observer {
        position: relative;
        top: -200px;
    }

    #date-group {
        #until {
            display: none;
        }

        #since {
            display: inline;
        }
    }
</style>
