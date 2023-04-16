{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<div class="view-container">
  <div class="list-container" bind:this={listContainer}>
    {#each searchResults as result (result.guid)}
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
  // import { onMount, onDestroy } from 'svelte';
  // import type { PubSubSubscription, PubSubUpdate } from '@nymphjs/client';
  import Paper, { Subtitle, Content } from '@smui/paper';
  import { navigating } from '$app/stores';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { searchResults } = data;
  $: ({ searchResults } = data);
  // let { loading } = stores;
  // $: ({ loading } = stores);

  // let subscription: PubSubSubscription<PubSubUpdate<(TodoClass & TodoData)[]>>;
  let failureMessage: string | undefined = undefined;
  let listContainer: HTMLDivElement;
  let contentContainer: HTMLDivElement;

  // Scroll to the top when the user changes the search query.
  let scrollNextNavigation = false;
  $: if (
    $navigating &&
    (!$navigating.to?.route.id?.startsWith('/social/search/[query]') ||
      $navigating.from?.params?.query !== $navigating.to?.params?.query)
  ) {
    scrollNextNavigation = true;
  }
  $: if (listContainer && $navigating == null && scrollNextNavigation) {
    listContainer.scrollTop = 0;
    scrollNextNavigation = false;
  }
  $: if (contentContainer && $navigating == null) {
    contentContainer.scrollTop = 0;
  }

  // let previousSubscribable = subscribable;
  // $: if (subscribable !== previousSubscribable) {
  //   subscribe();
  //   previousSubscribable = subscribable;
  // }

  // onMount(subscribe);
  // onDestroy(() => {
  //   if (subscription) {
  //     subscription.unsubscribe();
  //   }
  // });

  // function subscribe() {
  //   $loading = true;

  //   if (subscription) {
  //     subscription.unsubscribe();
  //   }

  //   if (subscribable) {
  //     subscription = subscribable(
  //       (update) => {
  //         pubsub.updateArray(searchResults, update);
  //         searchResults = searchResults;
  //         $loading = false;
  //         failureMessage = undefined;
  //       },
  //       (err) => {
  //         $loading = false;
  //         failureMessage = err?.message || 'An error occurred.';
  //       }
  //     );
  //   }
  // }
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

  * :global(.ellipsis) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
