<script lang="ts">
  import HeartRateMonitor from "./components/HeartRateMonitor.svelte";
  import OxygenMonitor from "./components/OxygenMonitor.svelte";
</script>

<main>
  <div class="dashboard">
    <HeartRateMonitor />
    <OxygenMonitor />
  </div>
</main>

<style>
  :global(body) {
    background-color: #121212;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
</style>
