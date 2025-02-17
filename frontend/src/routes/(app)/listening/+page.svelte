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
  let songs: ListeningDataSongInfo[] = $state([]);
  let scrollContainer = $state<HTMLElement>();
  let element = $state<HTMLElement>();
  let intersecting = $state(false);
  let firstLoadSuccess : boolean = $state(false)
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
  const insertChild = (
    parent: ListeningDataSongInfo,
    child: ListeningDataSongInfo,
    count: number = 0,
    grandParent: ListeningDataSongInfo = parent,
  ): void => {
    const setSize = (grandParent: ListeningDataSongInfo, size: number) =>
      (grandParent.size = size);
    if (count === 0) {
      console.log("count is zero");
      parent.show_children = false;
      parent.is_parent = true;
    }
    if (!parent.child) {
      console.log("inserting child");
      //parent.has_children = true;
      child.albums[0].image = "";
      child.is_child = true;
      parent.child = { ...child };
      setSize(grandParent, count + 1);
      return;
    } else if (parent.child) {
      return insertChild(parent.child, child, count + 1, grandParent);
    }
  };
  const childPropagation = (song: ListeningDataSongInfo) => {
    song.show_children = !song.show_children;
    if (song.child) childPropagation(song.child);
  };

  $inspect(listeningDataRequest);
  /**
   * @todo: add validation
   *
   * source for one artist matches: https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
   */
  const processSongs = (newSongs: ListeningDataSongInfo[]) => {
    for (let i = 0; i < newSongs.length; i++) {
      const curr = newSongs[i];
      // Check previous song only if it's in the new batch
      if (i > 0) {
        const prev = newSongs[i - 1];
        const oneArtistMatches = () =>
          curr.artists.some((a) => prev.artists.includes(a));
        const match = () =>
          prev.title === curr.title &&
          prev.albums[0].title === curr.albums[0].title &&
          oneArtistMatches();
        if (match()) {
          insertChild(prev, curr);
          //console.log(JSON.stringify(prev));
          newSongs.splice(i, 1);
          i -= 1;
          continue;
        }
      }
      songs.push(curr);
    }
  };
  //$inspect(songs);
  async function loadData(refresh: boolean) {
    if (refresh) {
      listeningDataRequest.offset = 0;
      songs = [];
    } else
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
      firstLoadSuccess = true
      const newSongs = response.data!.songs as typeof unProcessedSongs;
      if (newSongs.length) {
        if (refresh)
          unProcessedSongs = response.data!.songs as typeof unProcessedSongs;
        else unProcessedSongs.push(...newSongs);
        refreshStatus = { status: "idle" };
        processSongs(newSongs);
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
          <Song song={song} childPropagation={childPropagation} />
        {/each}
        <IntersectionObserver
          {element}
          on:intersect={async () =>
            allSongsLoaded ? () => "" : await loadData(false)}
          threshold={0.1}
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
    {:else if refreshStatus.status == "refreshing" && firstLoadSuccess === false}
      <p>loading...</p>
    {:else if refreshStatus.status == "error"}
      <h2>Error:</h2>
      <p>{refreshStatus.error}</p>
    {:else if firstLoadSuccess===false}
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
