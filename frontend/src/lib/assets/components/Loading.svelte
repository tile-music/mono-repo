<script>
  export let loading = true;

</script>

<style>

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1; /* Ensure the loading overlay is above other content but below the navbar */
  }

  .spinner {
    border: 16px solid #f3f3f3;
    border-top: 16px solid var(--accent);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

{#if loading}
  <div class="loading-overlay">
    <div class="spinner"></div>
  </div>
{/if}