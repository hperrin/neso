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
        {stuff}
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
            {stuff}
          />
        {/if}
      {:catch err}
        Error: {err}
      {/await}
    {/if}
  </div>
{:else if object.type === 'CollectionPage' || object.type === 'OrderedCollectionPage'}
  {#if items}
    <div class="next-scroll-container">
      <!-- TODO: implement infinite scroll -->
      <APObjectArray
        {items}
        {expand}
        {linkParent}
        {onlyActivities}
        {onlyActors}
        {onlyObjects}
        {stuff}
      />
    </div>
  {/if}
{:else}
  <Paper style="margin-bottom: 1em;">
    <Content>
      <div class="post-header">
        <Profile account={author} {stuff} />
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
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiReply} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiRepeat} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
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
        {stuff}
      />
    {/if}
  {/await}
{/if}

<script lang="ts">
  import type { APLink, APObject } from '_activitypub';
  import { mdiDotsHorizontal, mdiReply, mdiStar, mdiRepeat } from '@mdi/js';
  import sanitizeHtml from 'sanitize-html';
  import Paper, { Content } from '@smui/paper';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { Icon, Svg } from '@smui/common';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import Profile from '$lib/components/social/Profile.svelte';
  import APObjectArray from '$lib/components/social/APObjectArray.svelte';
  import type {
    SocialObject,
    SocialObjectData,
  } from '$lib/entities/SocialObject.js';
  import { getAuthorId } from '$lib/utils/getAuthorId.js';
  import { getInReplyTo } from '$lib/utils/getInReplyTo.js';
  import { isSocialObject } from '$lib/utils/checkTypes.js';
  import type { SessionStuff } from '$lib/nymph';

  export let object: SocialObject & SocialObjectData;
  export let expand: boolean;
  export let levelBar = false;
  export let linkParent = true;
  export let onlyActivities = false;
  export let onlyActors = false;
  export let onlyObjects = false;
  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

  let menu: Menu;
  let showSource = false;
  let sanitizeOptions = {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      '*': ['dir', 'align', 'alt', 'center', 'bgcolor'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'height', 'width'],
      tr: ['rowspan'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      table: ['cellspacing'],
    },
    allowedSchemes: ['mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['data'],
      a: ['http', 'https', 'mailto', 'tel'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName: string, attribs: { [k: string]: string }) => {
        if (attribs.class.match(/\bmention\b/)) {
          attribs.href = `/social/search/${encodeURIComponent(attribs.href)}`;
        } else {
          attribs.target = '_blank';
          attribs.rel = 'noopener noreferrer';
        }
        return {
          tagName,
          attribs,
        };
      },
    },
  };

  $: html =
    object.contentMap != null && 'en' in object.contentMap
      ? object.contentMap.en
      : object.content != null
      ? object.content
      : '<em>Unrecognized content.</em>';

  $: sanitizedHtml = sanitizeHtml(html.trim(), sanitizeOptions);

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
