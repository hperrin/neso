{#if object.type === 'Collection' || object.type === 'OrderedCollection'}
  <div class:level-bar={levelBar}>
    {#if items}
      <APObjectArray {items} {expand} {linkParent} {stuff} />
    {:else if object.first}
      {#await firstPromise}
        Loading...
      {:then firstEntity}
        {#if firstEntity}
          <svelte:self object={firstEntity} {expand} {linkParent} {stuff} />
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
      <APObjectArray {items} {expand} {linkParent} {stuff} />
    </div>
  {/if}
{:else}
  <Paper>
    <Content>
      <div class="post-header">
        <Profile account={author} {stuff} />
        <div>
          <RelativeDate date={object.published || object.cdate} />

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
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiDotsHorizontal} />
          </Icon>
        </IconButton>
      </div>
    </Content>
  </Paper>
{/if}

<pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
    object,
    null,
    2
  )}</pre>

{#if expand}
  {#await replies}
    <div class="loading">Loading...</div>
  {:then repliesObject}
    {#if repliesObject && isSocialObject(repliesObject)}
      <svelte:self
        object={repliesObject}
        {stuff}
        expand
        levelBar
        linkParent={false}
      />
    {/if}
  {/await}
{/if}

<script lang="ts">
  import type { APLink, APObject } from '_activitypub';
  import { mdiDotsHorizontal, mdiReply, mdiStar, mdiRepeat } from '@mdi/js';
  import sanitizeHtml from 'sanitize-html';
  import Paper, { Content } from '@smui/paper';
  import { Icon, Svg } from '@smui/common';
  import IconButton from '@smui/icon-button';
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
  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

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
      ? SocialObject.getId(
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
          ? SocialObject.getId(object.first[0])
          : object.first[0].href || object.first[0].id
          ? SocialObject.getId(object.first[0].href || object.first[0].id)
          : Promise.resolve(null)
        : typeof object.first === 'string'
        ? SocialObject.getId(object.first)
        : object.first.href || object.first.id
        ? SocialObject.getId(object.first.href || object.first.id)
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
