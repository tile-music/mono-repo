<script lang="ts">
  import {filters} from './filters.svelte';
  import type { ListeningDataRequest } from "../../../../../lib/Request";

  let { refresh }: { refresh: (filters: ListeningDataRequest) => void } =
    $props();
  
  const localFilters: ListeningDataRequest = $state({...filters});

  function updateFilters() {
    

  }
</script>

<div id="headers">
  <h2 id="art">art</h2>
  <h2 id="title">title</h2>
  <h2 id="artist">artist</h2>
  <h2 id="album">album</h2>
  <h2 id="duration">duration</h2>
  <h2 id="plays">plays</h2>
</div>

<style>
  #headers {
    display: flex;
    gap: 10px;
    padding: 1em 0 1em 60px;
    width: fit-content;
    flex-direction: row;
  }

  #art {
    width: 50px;
  }

  #title,
  #album {
    width: 300px;
  }

  #artist {
    width: 200px;
  }

  #duration,
  #plays {
    width: 100px;
  }
</style>
