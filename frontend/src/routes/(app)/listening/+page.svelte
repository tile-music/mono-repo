<script lang="ts">
  import type { PageData } from "./$types";
  import { deserialize } from "$app/forms";

  import Customize from "./Customize.svelte";
  import Song from "./Song.svelte";

  import type { ListeningDataResponse } from "../../../../../lib/Song";

  import { onMount } from "svelte";
  import type { ListeningDataRequest } from "../../../../../lib/Request";

  import { listeningColumns } from "./filters.svelte";

  interface Props {
    data: PageData;
  }

  let songs: ListeningDataResponse[] = $state([]);

  let refreshStatus:
    | { status: "refreshing" }
    | { status: "idle" }
    | { status: "error"; error: string } = $state({ status: "refreshing" });
  async function refresh(localFilters: ListeningDataRequest): Promise<void> {
    // send request
    console.log("refreshing");
    refreshStatus = { status: "refreshing" };
    const res = await fetch("?/refresh", {
      method: "POST",
      body: JSON.stringify(localFilters),
    });

    // parse response
    const response = deserialize(await res.text());
    console.log(response.data);
    if (response.type === "success") {
      refreshStatus = { status: "idle" };
      songs = response.data!.songs as typeof songs;
      console.log(`songs: ${songs[0]}`);
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
    }
  }
  onMount(() => refresh(listeningColumns));
</script>

<div id="container">
  <h1>Listening Data</h1>
  <div id="scroll-container">
    {#if songs.length}
      <Customize {refresh}/>
      <div id="songs">
        {#each songs as song}
          <Song {song} />
        {/each}
      </div>
    {:else if refreshStatus.status == "refreshing"}
      <p>loading...</p>
    {:else if refreshStatus.status == "error"}
      <p>{refreshStatus.error}</p>
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
