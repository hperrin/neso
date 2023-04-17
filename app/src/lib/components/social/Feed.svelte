<svelte:document on:scroll|passive|capture={handleDocumentScroll} />

<div class="view-container">
  <div class="list-container" bind:this={nextScrollContainer}>
    {#each activities as entry (entry.entity.guid)}
      <Activity
        bind:activity={entry.entity}
        actor={entry.actor || null}
        object={entry.object || null}
        target={entry.target || null}
        {stuff}
      />
    {:else}
      {emptyMessage}
    {/each}
    {#if loading}
      <div style="margin-top: 1em;">Loading...</div>
    {/if}
    {#if activities.length && finished}
      <div style="margin-top: 1em;">That's the end!</div>
    {/if}
  </div>
</div>

{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<script lang="ts">
  import Activity from '$lib/components/social/Activity.svelte';
  import type {
    SocialActivity as SocialActivityClass,
    SocialActivityData,
  } from '$lib/entities/SocialActivity.js';
  import type {
    SocialActor as SocialActorClass,
    SocialActorData,
  } from '$lib/entities/SocialActor.js';
  import type {
    SocialObject as SocialObjectClass,
    SocialObjectData,
  } from '$lib/entities/SocialObject.js';
  import { getActivityReferences } from '$lib/utils/getActivityReferences.js';
  import type { SessionStuff } from '$lib/nymph.js';

  export let feed: 'home' | 'favorites' | 'local' | 'global' | 'notifications';
  export let activities: {
    entity: SocialActivityClass & SocialActivityData;
    actor: (SocialActorClass & SocialActorData) | null;
    object:
      | (SocialActorClass & SocialActorData)
      | (SocialObjectClass & SocialObjectData)
      | null;
    target:
      | (SocialActorClass & SocialActorData)
      | (SocialObjectClass & SocialObjectData)
      | null;
  }[];
  export let emptyMessage: string;
  export let stuff: SessionStuff;

  let { SocialActivity, SocialObject } = stuff;
  $: ({ SocialActivity, SocialObject } = stuff);

  let nextScrollContainer: HTMLDivElement;
  let loading = false;
  let finished = activities.length < 20;
  let failureMessage: string | undefined = undefined;

  async function handleDocumentScroll() {
    if (nextScrollContainer == null || loading || finished) {
      return;
    }

    const el = nextScrollContainer.lastElementChild;
    if (el == null) {
      return;
    }

    const bounding = el.getBoundingClientRect();

    if (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.left <= window.innerWidth &&
      bounding.top <= window.innerHeight + 600
    ) {
      loading = true;

      try {
        let after = activities[activities.length - 1].entity.id;

        if (!after) {
          loading = false;
          finished = true;
          return;
        }

        let newPage = await SocialActivity.getFeed(feed, after);

        if (newPage.length < 20) {
          finished = true;
        }

        activities = [
          ...activities,
          ...(await Promise.all(
            newPage.map(async (entity) => {
              const { actor, object, target } = await getActivityReferences(
                entity,
                SocialObject
              );

              return { entity, actor, object, target };
            })
          )),
        ];

        failureMessage = undefined;
      } catch (e: any) {
        failureMessage = e.message;
      }

      loading = false;
    }
  }
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
