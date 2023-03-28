<div class="drawer-container">
  <Drawer
    variant={$smallWindow ? 'modal' : undefined}
    bind:open={$drawerOpen}
    class="app-drawer {$smallWindow
      ? 'app-drawer-adjust'
      : 'hide-initial-small'}"
  >
    {#if $smallWindow}
      <Header
        style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; min-height: auto; padding: 16px;"
      >
        <Title>
          <div style="display: inline-flex; align-items: center;">
            <Logo style="width: 32px; height: 32px;" />
            <span style="margin-left: .25em;">Neso</span>
          </div>
        </Title>
        {#if $miniWindow}
          <AccountMenu bind:stores />
        {/if}
      </Header>
    {/if}
    <Content class="app-drawer-content">
      <slot name="drawer" />

      <AppButtons />
    </Content>
  </Drawer>

  {#if $smallWindow}
    <Scrim />
  {/if}
  <AppContent class="app-app-content">
    <main class="app-main-content" bind:this={mainContent}>
      <slot />
    </main>
  </AppContent>
</div>

<script lang="ts">
  import Drawer, {
    Content,
    Scrim,
    AppContent,
    Header,
    Title,
  } from '@smui/drawer';
  import AppButtons from '$lib/components/AppButtons.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import AccountMenu from '$lib/components/AccountMenu.svelte';
  import { navigating } from '$app/stores';
  import type { SessionStuff } from '$lib/nymph';

  export let stores: SessionStuff['stores'];
  let { smallWindow, miniWindow, drawerOpen } = stores;
  $: ({ smallWindow, miniWindow, drawerOpen } = stores);

  let mainContent: HTMLElement;

  $: if (mainContent && $navigating == null) {
    mainContent.scrollTop = 0;
  }

  $: if ($navigating != null) {
    $drawerOpen = false;
  }
</script>

<style>
  @media (max-width: 720px) {
    * > :global(.hide-initial-small) {
      display: none;
    }
  }
</style>
