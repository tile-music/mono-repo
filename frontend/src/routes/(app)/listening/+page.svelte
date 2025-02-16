<script lang="ts">
  import type { PageData } from "./$types";
  import { deserialize } from "$app/forms";

  import Customize from "./Customize.svelte";
  import Song from "./Song.svelte";

  import type {
    AlbumInfo,
    ListeningDataSongInfo,
    SongInfo,
  } from "../../../../../lib/Song";
  import { onMount } from "svelte";
  import type { ListeningDataRequest } from "../../../../../lib/Request";

  import { listeningDataFilter } from "./filters.svelte";

  import IntersectionObserver from "svelte-intersection-observer";

  interface Props {
    data: PageData;
  }
  let allSongsLoaded = $state(false);
  let unProcessedSongs: ListeningDataSongInfo[] = $state([]);
  let songs: ListeningDataSongInfo[] = $state([])
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
  $inspect(listeningDataRequest);
  /**
   * @todo: add validation
   *
   * source for one artist matches: https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
   */
  const processSongs = () => {
    const insertChild = (
      parent: ListeningDataSongInfo,
      child: ListeningDataSongInfo,
      count: number = 0,
    ): void => {
      if (!parent.child) {
        if (count === 0) parent.is_parent = true;
        parent.has_children = true;
        parent.child = { ...child };
        return;
      } else if (parent.child && parent.has_children) {
        insertChild(parent.child, child, count + 1);
      }
    };
    for (let [i, songInfo] of unProcessedSongs.entries()) {
      //console.log(`offset: ${listeningDataRequest.offset}`)
      const k = i + listeningDataRequest.offset
      //console.log(`i: ${i}, songinfo: ${JSON.stringify(songInfo)} `)
      if (k > 1) {
        const prev = unProcessedSongs[k - 1];
        const curr = unProcessedSongs[k]
        const oneArtistMatches = () =>
          curr.artists.some((a) => prev.artists.includes(a));
        const match = () =>
          prev.title === curr.title &&
          prev.albums[0].title === curr.albums[0].title &&
          oneArtistMatches();
        if (match()) {
          insertChild(prev, curr);
         console.log(JSON.stringify(prev))
          continue;
        }
      }
      songs.push(songInfo);
    }
  }
  $inspect(songs)
  async function loadData(refresh: boolean) {
    if (refresh){ 
      listeningDataRequest.offset = 0;
      songs = [];
    }
    else
      listeningDataRequest.offset =
        listeningDataRequest.limit + listeningDataRequest.offset;
    console.log("fetching data");
    refreshStatus = refresh
      ? { status: "refreshing" }
      : { status: "loading-more" };
    const res = await fetch("?/loaddata", {
      method: "POST",
      body: JSON.stringify(listeningDataRequest),
    });

    const response = deserialize(await res.text());
    console.log(response);
    if (response.type === "success") {
      const newSongs = response.data!.songs as typeof unProcessedSongs;
      if (newSongs.length) {
        if (refresh)
          unProcessedSongs = response.data!.songs as typeof unProcessedSongs;
        else unProcessedSongs.push(...newSongs);
        refreshStatus = { status: "idle" };
        processSongs();
      }
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
      console.log(response.error);
      if (response.error.message === `"no songs returned"`) {
        allSongsLoaded = true;
      }
    }
  }

  $inspect(`all songs loaded ${allSongsLoaded}`);
  //$inspect(songs);

  onMount(async () => {
    await loadData(true);
  });
</script>

<div id="container">
  <h1>Listening Data</h1>
  <header class:intersecting></header>
  <div id="scroll-container">
    {#if songs.length}
      <Customize {loadData} />
      <div id="songs" bind:this={scrollContainer}>
        {#each songs as song}
          <Song {song} />
        {/each}
        <IntersectionObserver
          {element}
          on:intersect={async () =>
            allSongsLoaded ? () => "" : await loadData(false)}
          threshold={.1}
        >
          <div bind:this={element} id="load-more"></div>
          {#if refreshStatus.status == "loading-more"}
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

  #load-more {
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
