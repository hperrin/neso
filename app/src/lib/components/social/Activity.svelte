<div class="status-line">
  <div class="activity">
    <span class="name">
      {#if actor}
        <a
          class="actor-link"
          href={actor.id
            ? `/social/search/${encodeURIComponent(actor.id)}`
            : 'javascript:void(0);'}
        >
          {actor.nameMap && 'en' in actor.nameMap
            ? actor.nameMap.en
            : actor.name}
        </a>
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
      {targetPropositionMap[activity.type] || 'to'} a {target.type.toLowerCase()}
    {/if}

    <span
      class="date"
      title={new Date(
        activity.published || activity.cdate || 0
      ).toLocaleString()}
      ><RelativeDate date={activity.published || activity.cdate} /></span
    >
  </div>

  <a
    class="source-link"
    href={'javascript:void(0);'}
    on:click={() => (showSource = !showSource)}>show source</a
  >
</div>

{#if showSource}
  <pre
    style="max-width: 100%; max-height: 350px; overflow-x: auto;">{JSON.stringify(
      activity,
      null,
      2
    )}</pre>
{/if}

{#if object && isSocialObject(object)}
  <div style="margin-top: 1em; margin-bottom: 2em;">
    <Object bind:object {stuff} expand={false} />
  </div>
{/if}

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

  let showSource = false;

  const actionMap: { [k: string]: string } = {
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

  const targetPropositionMap: { [k: string]: string } = {
    Add: 'to',
    Join: '',
    Leave: '',
    Offer: 'to',
    Invite: 'to',
    Remove: 'from',
    Move: 'to',
  };
</script>

<style>
  .status-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .activity .name {
    font-weight: bold;
  }

  .actor-link,
  .source-link {
    color: inherit;
    text-decoration: none;
  }

  .actor-link:hover,
  .source-link:hover {
    text-decoration: underline;
  }

  .source-link {
    font-size: small;
    opacity: 0.4;
  }
</style>
