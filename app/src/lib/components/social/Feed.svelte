<div class="view-container">
  <div class="list-container">
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
  </div>
</div>

<script lang="ts">
  import Activity from '$lib/components/social/Activity.svelte';
  import type {
    SocialActivity,
    SocialActivityData,
  } from '$lib/entities/SocialActivity.js';
  import type {
    SocialActor,
    SocialActorData,
  } from '$lib/entities/SocialActor.js';
  import type {
    SocialObject,
    SocialObjectData,
  } from '$lib/entities/SocialObject.js';
  import type { SessionStuff } from '$lib/nymph';

  export let feed: 'home' | 'favorites' | 'local' | 'global' | 'notifications';
  export let activities: {
    entity: SocialActivity & SocialActivityData;
    actor: (SocialActor & SocialActorData) | null;
    object:
      | (SocialActor & SocialActorData)
      | (SocialObject & SocialObjectData)
      | null;
    target:
      | (SocialActor & SocialActorData)
      | (SocialObject & SocialObjectData)
      | null;
  }[];
  export let emptyMessage: string;
  export let stuff: SessionStuff;
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
