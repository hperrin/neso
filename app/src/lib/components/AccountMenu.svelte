<IconButton
  title="Account"
  on:click={() => $user != null && accountMenu.setOpen(true)}
  disabled={$user == null}
  class={Object.keys(anchorClasses).join(' ')}
  use={[
    [
      Anchor,
      {
        addClass,
        removeClass,
      },
    ],
  ]}
  bind:this={anchor}
>
  <Icon tag="img" class="avatar" src={$userAvatar} />
</IconButton>

<Portal>
  <Menu
    bind:this={accountMenu}
    anchorCorner="BOTTOM_LEFT"
    anchor={false}
    bind:anchorElement
  >
    {#if $user}
      <List>
        <Item on:SMUI:action={setTheme}>
          <Text>{lightTheme ? 'Lights Off' : 'Lights On'}</Text>
        </Item>
        <Item tag="a" href="/settings/general">
          <Text>Settings</Text>
        </Item>
        {#if $tilmeldAdmin}
          <Item tag="a" href="{base}/user/" rel="external">
            <Text>Admin App</Text>
          </Item>
        {/if}
        <Separator />
        <Item on:SMUI:action={logout}>
          <Text>Logout</Text>
        </Item>
      </List>
    {/if}
  </Menu>
</Portal>

<script lang="ts">
  import { onMount } from 'svelte';
  import Portal from 'svelte-portal';
  import IconButton from '@smui/icon-button';
  import List, { Item, Text, Separator } from '@smui/list';
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import { Icon } from '@smui/common';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import type { SessionStuff } from '$lib/nymph';

  export let stores: SessionStuff['stores'];
  let { tilmeldAdmin, user, userAvatar, settings } = stores;
  $: ({ tilmeldAdmin, user, userAvatar, settings } = stores);

  let accountMenu: Menu;
  let anchor: InstanceType<typeof IconButton>;
  let anchorElement: HTMLElement;
  let anchorClasses: { [k: string]: boolean } = {};

  $: lightTheme =
    $settings.theme === 'light'
      ? true
      : $settings.theme === 'dark'
      ? false
      : typeof window === 'undefined' ||
        (typeof window !== 'undefined' &&
          !window.matchMedia('(prefers-color-scheme: dark)').matches);

  onMount(() => {
    // This tells the menu surface to position itself relative to the body
    // instead of the anchor. Now the menu will position itself next to the
    // anchor, even though the menu itself is located in a portal.
    accountMenu.getMenuSurface().setIsHoisted(true);
    anchorElement = anchor.getElement();
  });

  function addClass(className: string) {
    if (!anchorClasses[className]) {
      anchorClasses[className] = true;
    }
  }

  function removeClass(className: string) {
    if (anchorClasses[className]) {
      delete anchorClasses[className];
      anchorClasses = anchorClasses;
    }
  }

  async function setTheme() {
    $settings.theme = lightTheme ? 'dark' : 'light';
    await $settings.$save();
    $settings = $settings;
  }

  async function logout() {
    if ($user == null) {
      return;
    }

    await $user.$logout();
    goto('/');
  }
</script>
