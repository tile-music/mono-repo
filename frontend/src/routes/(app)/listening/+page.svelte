<script lang="ts">
    import type { PageData } from './$types';
    import { deserialize } from "$app/forms";
    
    import Customize from './Customize.svelte';
    import Song from './Song.svelte';
    
    import { processSongs } from './processSongs';
    
    //import type {ListeningDataRequest} from "../../../../../lib/Request"

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let refreshStatus:
    | { status: "refreshing" }
    | { status: "idle" }
    | { status: "error"; error: string } = $state({ status: "refreshing" });
    async function refresh() : Promise<void> {
        // send request
        refreshStatus = { status: "refreshing" };
        const res = await fetch("?/refresh", {
            method: "POST",
            body: JSON.stringify({}),
        });

        // parse response
        const response = deserialize(await res.text());
        if (response.type === "success") {
            refreshStatus = { status: "idle" };
            data = response.data as typeof data;
        } else if (response.type === "error") {
            refreshStatus = { status: "error", error: response.error.message };
        }
    }
</script>

<div id="container">
    <h1>Listening Data</h1>
    <div class="scroll-container">
        {#if data.songs != null}
            <Customize/>
            <div id="songs">
                    {#each processSongs(data.songs) as song}
                        <Song {song} />
                    {/each}
            </div>
        {:else}
            <p>No listening data yet!</p>
        {/if}
    </div>
</div>

<style>
    #container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    #scroll-container {
        overflow-x: scroll;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    h1 {
        margin-bottom: 1em;
    }    

    #songs {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 20px;
        overflow-y: scroll;
        width: fit-content;
    }
</style>