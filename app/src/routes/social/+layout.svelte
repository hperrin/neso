<AppDrawerLayout {stores}>
  <List class="app-drawer-list" slot="drawer">
    <Item
      draggable="false"
      href="/social/feed"
      activated={$page.route.id === '/social/feed'}
      title="Posts from accounts and hashtags you follow"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiHome} />
        </Icon>
      </Graphic>
      <Text>Feed</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/notifications"
      activated={$page.route.id === '/social/notifications'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiBell} />
        </Icon>
      </Graphic>
      <Text>Notifications</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/local"
      activated={$page.route.id === '/social/local'}
      title="Posts from users on this server"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiAccountGroup} />
        </Icon>
      </Graphic>
      <Text>Local</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/global"
      activated={$page.route.id === '/social/global'}
      title="Posts from all federated servers this server can see"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiEarth} />
        </Icon>
      </Graphic>
      <Text>Global</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/favorites"
      activated={$page.route.id === '/social/favorites'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiStar} />
        </Icon>
      </Graphic>
      <Text>Favorites</Text>
    </Item>

    {#if failureMessage}
      <Item nonInteractive>
        <Text class="app-failure">
          {failureMessage}
        </Text>
      </Item>
    {/if}
  </List>

  <slot />
</AppDrawerLayout>

<script lang="ts">
  import {
    mdiHome,
    mdiBell,
    mdiAccountGroup,
    mdiEarth,
    mdiStar,
  } from '@mdi/js';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { Icon, Svg } from '@smui/common';
  import AppDrawerLayout from '$lib/components/AppDrawerLayout.svelte';
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  let { stores } = data;
  $: ({ stores } = data);

  let failureMessage: string | undefined = undefined;
</script>
