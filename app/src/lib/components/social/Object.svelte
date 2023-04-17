<Paper>
  <Content>
    <div class="post-header">
      <Profile account={author} {stuff} />
      <RelativeDate date={object.published || object.cdate} />
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
          <path fill="currentColor" d={mdiSync} />
        </Icon>
      </IconButton>
      <IconButton>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiStar} />
        </Icon>
      </IconButton>
      <IconButton>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiBookmark} />
        </Icon>
      </IconButton>
      <IconButton>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiDotsHorizontal} />
        </Icon>
      </IconButton>
    </div>
  </Content>
  <Content>
    <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
        object,
        null,
        2
      )}</pre>
  </Content>
</Paper>

<script lang="ts">
  import {
    mdiBookmark,
    mdiDotsHorizontal,
    mdiReply,
    mdiStar,
    mdiSync,
  } from '@mdi/js';
  import sanitizeHtml from 'sanitize-html';
  import Paper, { Subtitle, Content } from '@smui/paper';
  import { Icon, Svg } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import Profile from '$lib/components/social/Profile.svelte';
  import type {
    SocialObject,
    SocialObjectData,
  } from '$lib/entities/SocialObject.js';
  import { isLink, isObject } from '$lib/utils/checkTypes.js';
  import type { SessionStuff } from '$lib/nymph';

  export let object: SocialObject & SocialObjectData;
  export let stuff: SessionStuff;

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
        attribs.target = '_blank';
        attribs.rel = 'noopener noreferrer';
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

  $: author = Array.isArray(object.attributedTo)
    ? isLink(object.attributedTo[0])
      ? typeof object.attributedTo[0] === 'string'
        ? object.attributedTo[0]
        : object.attributedTo[0].href
      : isObject(object.attributedTo[0])
      ? object.attributedTo[0].id
      : object.attributedTo[0]
    : isLink(object.attributedTo)
    ? typeof object.attributedTo === 'string'
      ? object.attributedTo
      : object.attributedTo.href
    : isObject(object.attributedTo)
    ? object.attributedTo.id
    : object.attributedTo;
</script>

<style>
  .actions,
  .post-header {
    display: flex;
    justify-content: space-between;
  }

  .actions {
    margin-top: 5px;
  }
</style>
