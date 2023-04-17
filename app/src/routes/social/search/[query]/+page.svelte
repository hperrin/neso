{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<div class="view-container">
  <div class="list-container" bind:this={listContainer}>
    {#each searchResults as result (result.result.guid)}
      {#if isSocialActivity(result.result)}
        <Activity
          bind:activity={result.result}
          bind:actor={result.actor}
          bind:object={result.object}
          bind:target={result.target}
          stuff={data}
        />
      {:else if isSocialActor(result.result)}
        <Actor bind:actor={result.result} />
      {:else if isSocialObject(result.result)}
        <Object bind:object={result.result} expand stuff={data} />
      {:else}
        <Paper>
          <Title>Unknown Object Type</Title>
          <Content>
            <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
                result.result,
                null,
                2
              )}</pre>
          </Content>
        </Paper>
      {/if}
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
  import Paper, { Title, Content } from '@smui/paper';
  import { navigating } from '$app/stores';
  import Activity from '$lib/components/social/Activity.svelte';
  import Actor from '$lib/components/social/Actor.svelte';
  import Object from '$lib/components/social/Object.svelte';
  import {
    isSocialActivity,
    isSocialActor,
    isSocialObject,
  } from '$lib/utils/checkTypes.js';
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
</style>
