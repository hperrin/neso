<a
  href={account?.startsWith('http')
    ? `/social/search/${encodeURIComponent(account)}`
    : id?.startsWith('http')
    ? `/social/search/${encodeURIComponent(id)}`
    : actor && actor.id
    ? `/social/search/${encodeURIComponent(actor.id)}`
    : 'javascript:void(0)'}
  class="profile"
>
  {#if failurMessage}
    {failurMessage}
  {:else if loading}
    Loading...
  {:else if actor}
    <img
      class="avatar"
      src="/image-proxy?href={encodeURIComponent(icon)}"
      alt="{actor.name}'s avatar"
      width="128"
      height="128"
    />
    <span class="name" style="display: block;">
      <span style="display: block;">
        <strong>{actor.name}</strong>
      </span>
      <span
        >@{actor.preferredUsername}@{actor.id
          ? new URL(actor.id).hostname
          : 'Unknown'}</span
      >
    </span>
  {/if}
</a>

<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    SocialActor as SocialActorClass,
    SocialActorData,
  } from '$lib/entities/SocialActor.js';
  import type { SessionStuff } from '$lib/nymph';
  import { getActorIcon } from '$lib/utils/getActorIcon.js';

  export let account: string | null | undefined = null;
  export let actor: (SocialActorClass & SocialActorData) | undefined =
    undefined;
  export let stuff: SessionStuff;
  let { SocialActor, SocialObject } = stuff;
  $: ({ SocialActor, SocialObject } = stuff);

  let loading = actor == null;
  let failurMessage: string | null = null;
  let id: string | null | undefined = account;

  $: icon = getActorIcon(actor);

  onMount(async () => {
    if (actor == null) {
      if (
        account &&
        (account.match(/^@\S+@\S+$/) || account.match(/^\S+@\S+$/))
      ) {
        id = await SocialActor.fingerUser(account);
      }

      if (id == null) {
        failurMessage = 'User not found';
        loading = false;
        return;
      }

      actor = (await SocialObject.getId(id)) as SocialActorClass &
        SocialActorData;
      loading = false;
    }
  });
</script>

<style>
  .profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 5px;
    color: inherit;
    text-decoration: none;
  }

  .profile:hover {
    text-decoration: underline;
  }
</style>
