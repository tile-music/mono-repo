<script lang="ts">
    import type { PageProps, SubmitFunction } from "./$types";
    import Song from "./Song.svelte";
    import { Field, ValidatedInput, Button } from "$lib/ui";
    import { enhance } from "$app/forms";
    import IntersectionObserver from "$lib/components/IntersectionObserver.svelte";

    const { data, form }: PageProps = $props();

    let offset = $state(0);
    let limit = $state(50);

    let songs = $derived(data.songs);
    let status: "success" | "error" | "loading" | "exhausted" = $derived(
        data.status,
    );

    let formElement: HTMLFormElement;
    function submitForm() {
        formElement.requestSubmit();
    }

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
</script>

<form method="POST" bind:this={formElement} use:enhance={handleSubmit}>
    <Field>
        <label>
            <span>Start Date</span>
            <ValidatedInput
                type="date"
                name="start_date"
                id="start_date"
                value={new Date().toISOString().split("T")[0]}
                onchange={() => {
                    offset = 0;
                    songs = [];
                    submitForm();
                }}
            />
        </label>
    </Field>
    <input type="hidden" name="offset" bind:value={offset} />
    <input type="hidden" name="limit" bind:value={limit} />
</form>
<section>
    {#each songs as song}
        <Song {song} />
    {/each}
    {#if status === "success"}
        <div id="observer">
            <IntersectionObserver
                onIntersect={() => {
                    offset += limit;
                    submitForm();
                }}
            />
        </div>
    {:else if status === "loading"}
        <p>Loading more songs...</p>
    {:else if status === "exhausted"}
        <p>You've reached the beginning of your listening history!</p>
    {/if}
</section>

<style>
    section {
        padding-bottom: 1rem;
    }

    #observer {
        position: relative;
        top: -200px;
    }
</style>
