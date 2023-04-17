<div class="activity">
  <span class="name">
    {#if actor}
      {actor.nameMap && 'en' in actor.nameMap ? actor.nameMap.en : actor.name}
    {:else}
      Unknown user
    {/if}
  </span>

  <span class="action">
    {actionMap[activity.type]}
  </span>

  {#if object}
    a {object.type.toLowerCase()}
  {/if}

  {#if target}
    to a {target.type.toLowerCase()}
  {/if}

  <span
    class="date"
    title={new Date(activity.published || activity.cdate || 0).toLocaleString()}
    ><RelativeDate date={activity.published || activity.cdate} /></span
  >
</div>

{#if object && isSocialObject(object)}
  <div style="margin-top: 1em;">
    <Object bind:object {stuff} />
  </div>
{/if}

<pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
    activity,
    null,
    2
  )}</pre>

<script lang="ts">
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import Object from '$lib/components/social/Object.svelte';
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
  import { isSocialObject } from '$lib/utils/checkTypes.js';

  export let activity: SocialActivity & SocialActivityData;
  export let actor: (SocialActor & SocialActorData) | null;
  export let object:
    | (SocialObject & SocialObjectData)
    | (SocialActor & SocialActorData)
    | null;
  export let target:
    | (SocialObject & SocialObjectData)
    | (SocialActor & SocialActorData)
    | null;
  export let stuff: SessionStuff;

  const actionMap = {
    Accept: 'accepted',
    TentativeAccept: 'tentatively accepted',
    Add: 'added',
    Arrive: 'arrived at',
    Create: 'posted',
    Delete: 'deleted',
    Follow: 'followed',
    Ignore: 'ignored',
    Join: 'joined',
    Leave: 'left',
    Like: 'liked',
    Offer: 'offered',
    Invite: 'invited',
    Reject: 'rejected',
    TentativeReject: 'tentatively rejected',
    Remove: 'removed',
    Undo: 'undid',
    Update: 'updated',
    View: 'viewed',
    Listen: 'listened to',
    Read: 'read',
    Move: 'moved',
    Travel: 'traveled to',
    Announce: 'boosted',
    Block: 'blocked',
    Flag: 'flagged',
    Dislike: 'disliked',
    Question: 'asked a question',
  };

  const hasTargetMap = {
    Add: true,
    Join: true,
    Leave: true,
    Offer: true,
    Invite: true,
    Remove: true,
    Move: true,
  };
</script>

<style>
  .activity .name {
    font-weight: bold;
  }
</style>
