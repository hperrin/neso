<svelte:document on:scroll|passive|capture={handleDocumentScroll} />

{#if object.type === 'Collection' || object.type === 'OrderedCollection'}
  <div class:level-bar={levelBar}>
    {#if items}
      <APObjectArray
        {items}
        {expand}
        {linkParent}
        {onlyActivities}
        {onlyActors}
        {onlyObjects}
        bind:stuff
      />
    {:else if object.first}
      {#await firstPromise}
        Loading...
      {:then firstEntity}
        {#if firstEntity}
          <svelte:self
            object={firstEntity}
            {expand}
            {linkParent}
            {onlyActivities}
            {onlyActors}
            {onlyObjects}
            bind:stuff
          />
        {/if}
      {:catch err}
        Error: {err}
      {/await}
    {/if}
  </div>
{:else if object.type === 'CollectionPage' || object.type === 'OrderedCollectionPage'}
  {#if items}
    <div bind:this={nextScrollContainer}>
      <!-- TODO: implement infinite scroll -->
      <APObjectArray
        {items}
        {expand}
        {linkParent}
        {onlyActivities}
        {onlyActors}
        {onlyObjects}
        bind:stuff
        on:load={handleObjectArrayLoaded}
      />
    </div>
  {/if}

  {#await nextPromise then nextEntity}
    {#if nextEntity}
      <svelte:self
        object={nextEntity}
        {expand}
        {linkParent}
        {onlyActivities}
        {onlyActors}
        {onlyObjects}
        bind:stuff
      />
    {/if}
  {/await}
{:else}
  <Paper style="margin-bottom: 1em;">
    <Content>
      <div class="post-header">
        <Profile account={author} bind:stuff />
        <div>
          <a
            class="post-link"
            href={object.id
              ? `/social/search/${encodeURIComponent(object.id)}`
              : 'javascript:void(0);'}
          >
            <RelativeDate date={object.published || object.cdate} />
          </a>

          {#if linkParent && object.inReplyTo}
            <div class="reply-link">
              <a
                href="/social/search/{encodeURIComponent(
                  getInReplyTo(object) || ''
                )}">See Parent</a
              >
            </div>
          {/if}
        </div>
      </div>
      <div class="note">
        {@html sanitizedHtml}
      </div>
      <div class="actions">
        <IconButton on:click={() => ($inReplyTo = object)}>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiReply} />
          </Icon>
        </IconButton>
        <IconButton
          on:click={announce}
          pressed={!!object.$boosted}
          title={object.$boosted ? 'Unboost' : 'Boost'}
          disabled={loading}
        >
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiRepeat} />
          </Icon>
          <Icon component={Svg} viewBox="0 0 24 24" on>
            <path fill="currentColor" d={mdiRepeatOff} />
          </Icon>
        </IconButton>
        <IconButton
          on:click={like}
          pressed={!!object.$liked}
          title={object.$liked ? 'Unlike' : 'Like'}
          disabled={loading}
        >
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiStarOutline} />
          </Icon>
          <Icon component={Svg} viewBox="0 0 24 24" on>
            <path fill="currentColor" d={mdiStar} />
          </Icon>
        </IconButton>
        <div style="min-width: 100px;">
          <IconButton on:click={() => menu.setOpen(true)}>
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiDotsHorizontal} />
            </Icon>
          </IconButton>
          <Menu bind:this={menu}>
            <List>
              <Item on:SMUI:action={() => (showSource = !showSource)}>
                <Text>{showSource ? 'Hide' : 'Show'} Source</Text>
              </Item>
              <Separator />
              <Item on:SMUI:action={() => alert('not implemented')}>
                <Text>Block This Author</Text>
              </Item>
            </List>
          </Menu>
        </div>
      </div>
    </Content>
    {#if showSource}
      <Content>
        <pre
          style="max-width: 100%; max-height: 350px; overflow: auto;">{JSON.stringify(
            object,
            null,
            2
          )}</pre>
      </Content>
    {/if}
  </Paper>

  {#if failureMessage}
    <div class="app-failure">
      {failureMessage}
    </div>
  {/if}

  {#if expand}
    {#await replies}
      <div class="loading">Loading...</div>
    {:then repliesObject}
      {#if repliesObject && isSocialObject(repliesObject)}
        <svelte:self
          object={repliesObject}
          expand
          levelBar
          linkParent={false}
          onlyObjects
          bind:stuff
        />
      {/if}
    {/await}
  {/if}
{/if}

<script lang="ts">
  import type { APLink, APObject } from '_activitypub';
  import {
    mdiDotsHorizontal,
    mdiReply,
    mdiStarOutline,
    mdiStar,
    mdiRepeatOff,
    mdiRepeat,
  } from '@mdi/js';
  import Paper, { Content } from '@smui/paper';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { Icon, Svg } from '@smui/common';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import Profile from '$lib/components/social/Profile.svelte';
  import APObjectArray from '$lib/components/social/APObjectArray.svelte';
  import type {
    SocialActivity as SocialActivityClass,
    SocialActivityData,
  } from '$lib/entities/SocialActivity.js';
  import type {
    SocialObject as SocialObjectClass,
    SocialObjectData,
  } from '$lib/entities/SocialObject.js';
  import { getAuthorId } from '$lib/utils/getAuthorId.js';
  import { getInReplyTo } from '$lib/utils/getInReplyTo.js';
  import { isSocialObject } from '$lib/utils/checkTypes.js';
  import { sanitize } from '$lib/utils/sanitize.js';
  import { AP_PUBLIC_ADDRESS } from '$lib/utils/constants.js';
  import type { SessionStuff } from '$lib/nymph.js';

  export let object: SocialObjectClass & SocialObjectData;
  export let activity: (SocialActivityClass & SocialActivityData) | null = null;
  export let expand: boolean;
  export let levelBar = false;
  export let linkParent = true;
  export let onlyActivities = false;
  export let onlyActors = false;
  export let onlyObjects = false;
  export let stuff: SessionStuff;

  let { SocialActivity, SocialObject, stores } = stuff;
  $: ({ SocialActivity, SocialObject, stores } = stuff);
  let { inReplyTo } = stores;
  $: ({ inReplyTo } = stores);

  let menu: Menu;
  let nextScrollContainer: HTMLDivElement;
  let objectArrayLoaded = false;
  let showNextPage = false;
  let showSource = false;
  let loading = false;
  let failureMessage: string | undefined = undefined;

  $: html =
    object.contentMap != null && 'en' in object.contentMap
      ? object.contentMap.en
      : object.content != null
      ? object.content
      : '<em>Unrecognized content.</em>';

  $: sanitizedHtml = sanitize(html);

  $: author = getAuthorId(object);

  $: replies =
    expand && object.replies
      ? SocialObject.getIdObject(
          typeof object.replies === 'string'
            ? object.replies
            : object.replies.href || object.replies.id
        )
      : Promise.resolve(null);

  $: items = (
    object.items
      ? Array.isArray(object.items)
        ? object.items
        : [object.items]
      : object.first && object.first.items
      ? Array.isArray(object.first.items)
        ? object.first.items
        : [object.first.items]
      : object.orderedItems
      ? Array.isArray(object.orderedItems)
        ? object.orderedItems
        : [object.orderedItems]
      : object.first && object.first.orderedItems
      ? Array.isArray(object.first.orderedItems)
        ? object.first.orderedItems
        : [object.first.orderedItems]
      : null
  ) as (APObject | APLink)[] | null;

  $: firstPromise =
    (object.type === 'Collection' ||
      object.type === 'OrderedCollection' ||
      object.type === 'CollectionPage' ||
      object.type === 'OrderedCollectionPage') &&
    object.first
      ? Array.isArray(object.first)
        ? typeof object.first[0] === 'string'
          ? SocialObject.getIdObject(object.first[0])
          : object.first[0].href || object.first[0].id
          ? SocialObject.getIdObject(object.first[0].href || object.first[0].id)
          : Promise.resolve(null)
        : typeof object.first === 'string'
        ? SocialObject.getIdObject(object.first)
        : object.first.href || object.first.id
        ? SocialObject.getIdObject(object.first.href || object.first.id)
        : Promise.resolve(null)
      : Promise.resolve(null);

  $: nextPromise =
    showNextPage &&
    (object.type === 'CollectionPage' ||
      object.type === 'OrderedCollectionPage') &&
    object.next
      ? Array.isArray(object.next)
        ? typeof object.next[0] === 'string'
          ? SocialObject.getIdObject(object.next[0])
          : object.next[0].href || object.next[0].id
          ? SocialObject.getIdObject(object.next[0].href || object.next[0].id)
          : Promise.resolve(null)
        : typeof object.next === 'string'
        ? SocialObject.getIdObject(object.next)
        : object.next.href || object.next.id
        ? SocialObject.getIdObject(object.next.href || object.next.id)
        : Promise.resolve(null)
      : Promise.resolve(null);

  function handleObjectArrayLoaded() {
    objectArrayLoaded = true;
  }

  function handleDocumentScroll() {
    if (nextScrollContainer == null || !objectArrayLoaded || showNextPage) {
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
      showNextPage = true;
    }
  }

  async function like() {
    loading = true;

    try {
      if (object.$liked) {
        const activitiyEntity = await SocialActivity.factory();

        activitiyEntity.to = [AP_PUBLIC_ADDRESS];
        activitiyEntity.type = 'Undo';
        activitiyEntity.object = object.$liked;

        if (!(await activitiyEntity.$send())) {
          failureMessage = "Couldn't boost post.";
        } else {
          await object.$refresh();
          object = object;
          failureMessage = undefined;
        }
      } else {
        const activitiyEntity = await SocialActivity.factory();

        activitiyEntity.to = [AP_PUBLIC_ADDRESS];
        activitiyEntity.type = 'Like';
        if (activity) {
          activitiyEntity.object = activity.id;
        } else {
          activitiyEntity.object = (await object.$getActivity()) || undefined;
        }

        if (!(await activitiyEntity.$send())) {
          failureMessage = "Couldn't like post.";
        } else {
          await object.$refresh();
          object = object;
          failureMessage = undefined;
        }
      }
    } catch (e: any) {
      failureMessage = e.message;
    }

    loading = false;
  }

  async function announce() {
    loading = true;

    try {
      if (object.$boosted) {
        const activitiyEntity = await SocialActivity.factory();

        activitiyEntity.to = [AP_PUBLIC_ADDRESS];
        activitiyEntity.type = 'Undo';
        activitiyEntity.object = object.$boosted;

        if (!(await activitiyEntity.$send())) {
          failureMessage = "Couldn't boost post.";
        } else {
          await object.$refresh();
          object = object;
          failureMessage = undefined;
        }
      } else {
        const activitiyEntity = await SocialActivity.factory();

        activitiyEntity.to = [AP_PUBLIC_ADDRESS];
        activitiyEntity.type = 'Announce';
        if (activity) {
          activitiyEntity.object = activity.id;
        } else {
          activitiyEntity.object = (await object.$getActivity()) || undefined;
        }

        if (!(await activitiyEntity.$send())) {
          failureMessage = "Couldn't boost post.";
        } else {
          await object.$refresh();
          object = object;
          failureMessage = undefined;
        }
      }
    } catch (e: any) {
      failureMessage = e.message;
    }

    loading = false;
  }
</script>

<style>
  .post-header,
  .actions {
    display: flex;
    justify-content: space-between;
  }

  .actions,
  .loading {
    margin-top: 1em;
  }

  .post-link,
  .reply-link {
    color: inherit;
    text-decoration: none;
  }

  .post-link:hover,
  .reply-link:hover {
    text-decoration: underline;
  }

  .reply-link {
    font-size: small;
    text-align: right;
  }

  .level-bar {
    border-left: 1px solid #666;
    margin-left: 0.5em;
    padding-left: 0.5em;
  }
</style>
