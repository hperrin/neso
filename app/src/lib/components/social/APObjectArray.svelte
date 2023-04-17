{#await itemsPromise}
  Loading...
{:then itemEntities}
  {#each itemEntities as entity (entity.guid)}
    {#if isSocialActivity(entity)}
      <Activity
        bind:activity={entity}
        actor={null}
        object={null}
        target={null}
        {stuff}
      />
    {:else if isSocialActor(entity)}
      <Actor bind:actor={entity} />
    {:else if isSocialObject(entity)}
      <Object bind:object={entity} {expand} {linkParent} {stuff} />
    {:else}
      <Paper>
        <Title>Unknown Object Type</Title>
        <Content>
          <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
              entity,
              null,
              2
            )}</pre>
        </Content>
      </Paper>
    {/if}
  {/each}
{:catch err}
  Error: {err}
{/await}

<script lang="ts">
  import type { APObject, APLink } from '_activitypub';
  import Paper, { Title, Content } from '@smui/paper';
  import Activity from '$lib/components/social/Activity.svelte';
  import Actor from '$lib/components/social/Actor.svelte';
  import Object from '$lib/components/social/Object.svelte';
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
  import {
    isSocialActivity,
    isSocialActor,
    isSocialObject,
  } from '$lib/utils/checkTypes.js';
  import type { SessionStuff } from '$lib/nymph';

  export let items: (APObject | APLink)[];
  export let expand: boolean;
  export let linkParent = true;
  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

  let itemsPromise = Promise.all(
    items.map((item) =>
      SocialObject.getId(typeof item === 'string' ? item : item.href || item.id)
    )
  ).then((entities) => entities.filter((e) => e != null)) as Promise<
    (
      | (SocialActivityClass & SocialActivityData)
      | (SocialActorClass & SocialActorData)
      | (SocialObjectClass & SocialObjectData)
    )[]
  >;
</script>
