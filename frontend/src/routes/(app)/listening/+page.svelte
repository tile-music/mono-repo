<script lang="ts">
  import type { PageData } from "./$types";
  import { deserialize } from "$app/forms";

  import Customize from "./Customize.svelte";
  import Song from "./Song.svelte";

  import type {
    AlbumInfo,
    ListeningDataResponse,
    SongInfo,
  } from "../../../../../lib/Song";
  import type { ListeningDataSongInfo } from "./filters.svelte";
  import { onMount } from "svelte";
  import type { ListeningDataRequest } from "../../../../../lib/Request";

  import { listeningDataFilter } from "./filters.svelte";

  import IntersectionObserver from "svelte-intersection-observer";

  interface Props {
    data: PageData;
  }
  let allSongsLoaded = $state(false);
  let unProcessedSongs: SongInfo[] = $state([]);
  /**
   * @todo: add validation
   *
   * source for one artist matches: https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
   */
  let songs: ListeningDataSongInfo[] = $derived.by(() => {
    let ret: ListeningDataSongInfo[] = [];
    /*
    const songComparator = (curr:ListeningDataSongInfo , prev:ListeningDataSongInfo | null, keys: string[] = ["album_title", "track_name", "artist_name"]) => {
      let ret = false

      //i was trying to be able to pick what metrics the songs were compaired by but i think thats just out of scope atp 
      const keyConverter = (key: string, song: ListeningDataSongInfo): string | number | string[] => {
        try{
          if(key.includes("album_")) return song["albums"][0][key.replace("album_","") as keyof AlbumInfo]
          if(key.includes("song_") ) {
            const songKey = key.replace("song_", "") as keyof ListeningDataSongInfo;
            return song[songKey] 
          }
        } catch (e){
          throw new Error(`FATAL: Error: ${e}, key: ${key}, song: ${song}`)
        }
        } 
        const songComparatorHelper = (e: ListeningDataSongInfo, k: string) => keyConverter(e, k) === keyConverter(e, k)
        keys.forEach(k => );
        return ret
        
      }
      */

    for (const [i, songInfo] of unProcessedSongs.entries()) {
      const ldSongInfo: ListeningDataSongInfo = {
        ...songInfo,
        has_children: false,
        is_child: false,
        is_parent: false,
      };
      if (i > 1) {
        const prev = unProcessedSongs[i - 1];
        const oneArtistMatches = () =>
          songInfo.artists.some((r) => prev.artists.includes(r));
        const match = () =>
          prev.title === songInfo.title &&
          prev.albums[0].title === songInfo.albums[0].title &&
          oneArtistMatches();
        if (match()) insert();
      }

    }
  });
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
    console.log(response);
    if (response.type === "success") {
      const newSongs = response.data!.songs as typeof unProcessedSongs;
      if (newSongs.length) {
        unProcessedSongs.push(...newSongs);
        refreshStatus = { status: "idle" };
      } else if (unProcessedSongs === null) {
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

  async function refresh(): Promise<void> {
    allSongsLoaded = false;
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

      unProcessedSongs = response.data!.songs as typeof unProcessedSongs;
      console.log(`songs: ${unProcessedSongs[0]}`);
    } else if (response.type === "error") {
      refreshStatus = { status: "error", error: response.error.message };
    }
  }
  $inspect(unProcessedSongs);

  onMount(async () => {
    await refresh();
  });
</script>

<div id="container">
  <h1>Listening Data</h1>
  <header class:intersecting></header>
  <div id="scroll-container">
    {#if unProcessedSongs.length}
      <Customize {refresh} />
      <div id="songs" bind:this={scrollContainer}>
        {#each unProcessedSongs as song}
          <Song {song} />
        {/each}
        <IntersectionObserver
          {element}
          on:intersect={async () =>
            allSongsLoaded ? () => "" : await loadData()}
          threshold={1}
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
