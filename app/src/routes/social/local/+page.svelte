<div class="view-container">
  <div class="list-container">
    {#each activities as result (result.guid)}
      <Paper>
        <Subtitle>
          <span title={new Date(result.cdate || 0).toLocaleString()}
            ><RelativeDate date={result.cdate} /></span
          >
        </Subtitle>
        <Content>
          <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
              result,
              null,
              2
            )}</pre>
        </Content>
      </Paper>
    {:else}
      <Paper>
        <Content>Nothing was found that matches the search query.</Content>
      </Paper>
    {/each}
  </div>
</div>

<script lang="ts">
  import Paper, { Subtitle, Content } from '@smui/paper';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { activities } = data;
  $: ({ activities } = data);
</script>

<style>
  .view-container {
    display: flex;
    height: 100%;
  }

  .list-container {
    padding: 1rem;
    justify-content: center;
    flex-grow: 1;
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
  }
</style>
