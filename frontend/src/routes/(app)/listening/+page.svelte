<script lang="ts">
  import type { PageData } from "./$types";
  import { deserialize } from "$app/forms";

  import Customize from "./Customize.svelte";
  import Song from "./Song.svelte";

  import type { ListeningDataResponse, SongInfo } from "../../../../../lib/Song";

  import { onMount } from "svelte";
  import type { ListeningDataRequest } from "../../../../../lib/Request";

  import { listeningDataFilter } from "./filters.svelte";

  import IntersectionObserver from "svelte-intersection-observer";


  interface Props {
    data: PageData;
  }
  let allSongsLoaded = $state(false)
  let songs: ListeningDataResponse[] = $state([]);
  let scrollContainer = $state<HTMLElement>(null);
  let element = $state<HTMLElement>();
  let intersecting = $state(false);
  let refreshStatus:
    | { status: "refreshing" }
    | { status: "idle" }
    | { status: "loading-more" }
    | { status: "error"; error: string } = $state({ status: "refreshing" });
  const listeningDataRequest: ListeningDataRequest =
    $derived<ListeningDataRequest>({
      ...listeningDataFilter,
      limit: 100,
      offset: 0,
    });

  async function loadData() {
    listeningDataRequest.offset =
      listeningDataRequest.limit + listeningDataRequest.offset;
    console.log("fetching data");
    refreshStatus = { status: "loading-more" };
    listeningDataRequest.offset =
      listeningDataRequest.offset + listeningDataRequest.limit;
    const res = await fetch("?/loaddata", {
      method: "POST",
      body: JSON.stringify(listeningDataRequest),
    });

    const response = deserialize(await res.text());
    console.log(response)
    if (response.type === "success") {
      const newSongs = response.data!.songs as typeof songs
      if(newSongs.length) {
        songs.push(...newSongs)
        refreshStatus = { status: "idle" }; 
      } else if (songs === null){
        

      }
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
      console.log(response.error);
      if(response.error.message === `"no songs returned"`){
        allSongsLoaded = true
      }
    }
  }
  $inspect(`all songs loaded ${allSongsLoaded}`)
  async function refresh(): Promise<void> {
    listeningDataRequest.offset = 0;
    // send request
    console.log("refreshing");
    refreshStatus = { status: "refreshing" };
    const res = await fetch("?/loaddata", {
      method: "POST",
      body: JSON.stringify(listeningDataRequest),
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
  $inspect(songs)


  onMount(async () => {
    await refresh();
    /* let observerOptions = $state({
      root: loadMore,
      rootMargin: "0px",
      threshold: 1,
    });

    
    const observer = $derived(new IntersectionObserver(loadData, observerOptions));
    $inspect(observer) */
    /* if (scrollContainer) {
			console.log("listElm is defined");
			scrollContainer.addEventListener("scroll", function () {
				if (
					scrollContainer.scrollTop + scrollContainer.clientHeight >=
					scrollContainer.scrollHeight
				) {
					loadData(listeningColumns);
				}
			});
		} */
  });
</script>

<div id="container">
  <h1>Listening Data</h1>
  <header class:intersecting></header>
  <div id="scroll-container">
    {#if songs.length}
      <Customize {refresh} />
      <div id="songs" bind:this={scrollContainer}>
        {#each songs as song}
          <Song {song} />
        {/each}
        <IntersectionObserver {element} on:intersect={async(e) => allSongsLoaded ? () => "" : await loadData()} threshold={1}>
          <div bind:this={element} id=load-more>

          </div>
          {#if refreshStatus.status == "loading-more" }
          <p>loading</p>
          {/if}
          {#if allSongsLoaded}
          <p>no more songs to load</p>
          {/if}
        </IntersectionObserver>
      </div>

    {:else if refreshStatus.status == "refreshing"}
      <p>loading...</p>
    {:else if refreshStatus.status == "error"}
      <h2>Error:</h2>
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
  #load-more{
    height: -1000px;


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
