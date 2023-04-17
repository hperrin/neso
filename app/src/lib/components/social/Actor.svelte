<Paper style="margin-bottom: 1em; overflow: hidden;">
  <div
    class="author-header"
    style="background-image: url(/image-proxy?href={encodeURIComponent(
      image
    )});"
  >
    <img
      class="avatar"
      src="/image-proxy?href={encodeURIComponent(icon)}"
      alt="{actor.name}'s avatar"
    />
  </div>
  <Content>
    <div class="actions">
      <Button variant="raised" style="margin-right: 1em;">
        <Label>Follow</Label>
      </Button>
      <div>
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
    <div class="name">
      <span style="display: block;">
        <strong>{actor.name}</strong>
      </span>
      <span
        >@{actor.preferredUsername}@{actor.id
          ? new URL(actor.id).hostname
          : 'Unknown'}</span
      >
    </div>
    <div class="note">
      {@html sanitizedHtml}
    </div>
    {#if expand && attachment.length}
      <div class="attachments">
        <List nonInteractive twoLine>
          {#each attachment as attach, i}
            <Item
              style={i === 0 ? '' : 'margin-top: 0.5em;'}
              class="attachment"
            >
              <Text>
                <PrimaryText>{attach.name.toUpperCase()}</PrimaryText>
                <SecondaryText>{@html attach.value}</SecondaryText>
              </Text>
            </Item>
          {/each}
        </List>
      </div>
    {/if}
  </Content>
  {#if showSource}
    <Content>
      <pre
        style="max-width: 100%; max-height: 350px; overflow: auto;">{JSON.stringify(
          actor,
          null,
          2
        )}</pre>
    </Content>
  {/if}
</Paper>

{#if expand}
  <TabBar
    tabs={['Posts', 'Followers', 'Following']}
    let:tab
    bind:active={activeTab}
    style="margin-bottom: 1em;"
  >
    <Tab {tab}>
      <Label>{tab}</Label>
    </Tab>
  </TabBar>

  {#if activeTab === 'Posts'}
    {#await outbox}
      <div class="loading">Loading...</div>
    {:then outboxObject}
      {#if outboxObject}
        <Object object={outboxObject} expand={false} onlyActivities {stuff} />
      {/if}
    {/await}
  {:else if activeTab === 'Followers'}
    {#await followers}
      <div class="loading">Loading...</div>
    {:then followersObject}
      {#if followersObject}
        <Object object={followersObject} expand={false} onlyActors {stuff} />
      {/if}
    {/await}
  {:else if activeTab === 'Following'}
    {#await following}
      <div class="loading">Loading...</div>
    {:then followingObject}
      {#if followingObject}
        <Object object={followingObject} expand={false} onlyActors {stuff} />
      {/if}
    {/await}
  {/if}
{/if}

<script lang="ts">
  import type { APObject } from '_activitypub';
  import { mdiDotsHorizontal } from '@mdi/js';
  import Paper, { Content } from '@smui/paper';
  import Menu from '@smui/menu';
  import List, {
    Item,
    Separator,
    Text,
    PrimaryText,
    SecondaryText,
  } from '@smui/list';
  import Tab from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import Button from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { Label, Icon, Svg } from '@smui/common';
  import Object from '$lib/components/social/Object.svelte';
  import type {
    SocialActor,
    SocialActorData,
  } from '$lib/entities/SocialActor.js';
  import { getActorIcon } from '$lib/utils/getActorIcon.js';
  import { getActorImage } from '$lib/utils/getActorImage.js';
  import { sanitize } from '$lib/utils/sanitize.js';
  import type { SessionStuff } from '$lib/nymph';

  export let actor: SocialActor & SocialActorData;
  export let expand: boolean;
  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

  let menu: Menu;
  let showSource = false;
  let activeTab = 'Posts';

  $: html =
    actor.summaryMap != null && 'en' in actor.summaryMap
      ? actor.summaryMap.en
      : actor.summary != null
      ? actor.summary
      : '';

  $: sanitizedHtml = sanitize(html);

  $: icon = getActorIcon(actor);

  $: image = getActorImage(actor);

  $: attachment = (() => {
    if (!expand) {
      return [];
    }

    const attachments = actor.attachment
      ? Array.isArray(actor.attachment)
        ? actor.attachment
        : [actor.attachment]
      : [];

    return (
      attachments.filter(
        (attachment) =>
          typeof attachment === 'object' &&
          'type' in attachment &&
          attachment.type === 'http://schema.org#PropertyValue'
      ) as APObject[]
    ).map((attachment: APObject) => ({
      name: attachment.name || 'Unknown',
      value: sanitize(attachment['http://schema.org#value'] || ''),
    }));
  })();

  $: outbox = actor.outbox
    ? SocialObject.getIdObject(actor.outbox)
    : Promise.resolve(null);

  $: followers = actor.followers
    ? SocialObject.getIdObject(actor.followers)
    : Promise.resolve(null);

  $: following = actor.following
    ? SocialObject.getIdObject(actor.following)
    : Promise.resolve(null);
</script>

<style>
  .author-header {
    min-height: 300px;
    margin: -24px -16px 0;
    background-size: cover;
    position: relative;
    margin-bottom: calc(1em);
  }

  .actions {
    min-height: 64px;
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
  }

  .avatar {
    position: absolute;
    left: 1em;
    top: calc(100% - 64px);
    width: 128px;
    height: 128px;
  }

  .attachments :global(.attachment) {
    border: 1px var(--mdc-theme-primary) solid;
  }

  .loading {
    margin-top: 1em;
  }
</style>
