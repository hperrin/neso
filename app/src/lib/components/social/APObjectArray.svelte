{#await itemsPromise}
  Loading...
{:then itemEntities}
  {#each itemEntities as entry (entry.entity.guid)}
    {#if isSocialActivity(entry.entity)}
      <Activity
        bind:activity={entry.entity}
        actor={entry.actor || null}
        object={entry.object || null}
        target={entry.target || null}
        bind:stuff
      />
    {:else if isSocialActor(entry.entity)}
      <Actor bind:actor={entry.entity} expand={false} bind:stuff />
    {:else if isSocialObject(entry.entity)}
      <Object bind:object={entry.entity} {expand} {linkParent} bind:stuff />
    {:else}
      <Paper>
        <Title>Unknown Object Type</Title>
        <Content>
          <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
              entry.entity,
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
  import { createEventDispatcher } from 'svelte';
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
  import { getActivityReferences } from '$lib/utils/getActivityReferences.js';
  import {
    isSocialActivity,
    isSocialActor,
    isSocialObject,
  } from '$lib/utils/checkTypes.js';
  import type { SessionStuff } from '$lib/nymph.js';

  const dispatch = createEventDispatcher();

  export let items: (APObject | APLink)[];
  export let expand: boolean;
  export let linkParent = true;
  export let onlyActivities = false;
  export let onlyActors = false;
  export let onlyObjects = false;
  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

  let itemsPromise = (
    Promise.all(
      items.map((item) =>
        getId(typeof item === 'string' ? item : item.href || item.id)
      )
    ).then((entities) => entities.filter((e) => e != null)) as Promise<
      (
        | (SocialActivityClass & SocialActivityData)
        | (SocialActorClass & SocialActorData)
        | (SocialObjectClass & SocialObjectData)
      )[]
    >
  ).then(async (entities) => {
    const entries = [];

    for (let entity of entities) {
      if (isSocialActivity(entity)) {
        const { actor, object, target } = await getActivityReferences(
          entity,
          SocialObject
        );

        entries.push({ entity, actor, object, target });
      } else {
        entries.push({ entity });
      }
    }

    dispatch('load');

    return entries;
  });

  async function getId(id: string) {
    if (onlyActivities) {
      return await SocialObject.getIdActivity(id);
    }

    if (onlyActors) {
      return await SocialObject.getIdActor(id);
    }

    if (onlyObjects) {
      return await SocialObject.getIdObject(id);
    }

    return await SocialObject.getId(id);
  }
</script>
