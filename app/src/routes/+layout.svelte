<svelte:window on:resize={setMiniWindow} />

<svelte:head>
  <!-- Combined SMUI and Site Styles -->
  {#if $user != null && $settings.theme === 'light'}
    <link rel="stylesheet" href="/smui.css" />
  {:else if $user != null && $settings.theme === 'dark'}
    <link rel="stylesheet" href="/smui.css" />
    <link rel="stylesheet" href="/smui-dark.css" />
  {:else}
    <!-- SMUI Styles -->
    <link
      rel="stylesheet"
      href="/smui.css"
      media="(prefers-color-scheme: light)"
    />
    <link
      rel="stylesheet"
      href="/smui-dark.css"
      media="screen and (prefers-color-scheme: dark)"
    />
  {/if}

  {#if !$user}
    <style type="text/css">
      html {
        height: 100% !important;
        width: 100% !important;
        position: static;
      }
    </style>
  {/if}
</svelte:head>

<div style="position: absolute; width: 100%; z-index: 10000;">
  <LinearProgress indeterminate closed={!$navigating && !$loading} />
</div>

{#if promisesReady}
  <TopAppBar
    variant="static"
    class="app-top-app-bar"
    color={$settings.bar || 'primary'}
  >
    <Row>
      <Section style="flex-grow: 0;">
        {#if $user != null && $smallWindow && parsedApp !== 'oauth'}
          <IconButton on:click={() => ($drawerOpen = !$drawerOpen)}>
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiMenu} />
            </Icon>
          </IconButton>
        {/if}
        {#if $user == null || !$smallWindow || parsedApp === 'oauth'}
          <Title
            tag="a"
            href="/"
            style="color: unset; display: inline-flex; align-items: center;"
          >
            <Logo style="width: 32px; height: 32px;" />
            <span style="margin-left: .25em;">Neso</span>
          </Title>
        {/if}
      </Section>
      <Section class="app-top-app-bar-content">
        {#if $user}
          <SearchBox {stores} compact={$miniWindow} />
        {/if}
      </Section>
      {#if (!$miniWindow || parsedApp === 'oauth') && $user}
        <Section
          align="end"
          toolbar
          style="flex-grow: 0; color: var(--mdc-on-surface, #000);"
        >
          <AccountMenu bind:stores />
        </Section>
      {/if}
      {#if !$user}
        <Section
          align="end"
          toolbar
          style="flex-grow: 0; color: var(--mdc-on-surface, #000);"
        >
          <Button href="{base}/about">
            <Label>About</Label>
          </Button>
        </Section>
      {/if}
    </Row>
  </TopAppBar>

  <slot />
{:else}
  <div
    style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 0;"
  >
    <CircularProgress indeterminate style="height: 80px; width: 80px;" />
    Loading...
  </div>
{/if}

{#if $user === undefined}
  <div
    style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;"
  >
    <CircularProgress style="height: 120px; width: 120px;" indeterminate />
  </div>
{/if}

<script lang="ts">
  import { onMount } from 'svelte';
  import { mdiMenu } from '@mdi/js';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import LinearProgress from '@smui/linear-progress';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import { Label, Icon, Svg } from '@smui/common';
  import Logo from '$lib/components/Logo.svelte';
  import AccountMenu from '$lib/components/AccountMenu.svelte';
  import parseApp from '$lib/utils/parseApp';
  import { base } from '$app/paths';
  import { navigating, page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import SearchBox from './_SearchBox.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  let { stores } = data;
  $: ({ stores } = data);
  let {
    readyPromise,
    settingsReadyPromise,
    loading,
    user,
    smallWindow,
    miniWindow,
    drawerOpen,
    settings,
  } = stores;
  $: ({
    readyPromise,
    settingsReadyPromise,
    loading,
    user,
    smallWindow,
    miniWindow,
    drawerOpen,
    settings,
  } = stores);

  $: parsedApp = parseApp($page.url);

  // When the page first loads, the promises are already done.
  let promisesReady = true;

  let previousSettingsReadyPromise = $settingsReadyPromise;
  $: if ($settingsReadyPromise !== previousSettingsReadyPromise) {
    // When the user logs in, the promises will change.
    promisesReady = false;
    Promise.all([$readyPromise, $settingsReadyPromise]).then(() => {
      promisesReady = true;
    });
    previousSettingsReadyPromise = $settingsReadyPromise;
  }

  let previousUser = $user;
  $: (async () => {
    if (previousUser !== $user) {
      $loading = true;
      previousUser = $user;
      if (
        previousUser != $user &&
        previousUser !== undefined &&
        (!previousUser || !$user || previousUser.guid !== $user.guid)
      ) {
        // Invalidate if going from logged in to not or vice versa.
        await invalidate('/rest');
      }
      $loading = false;
    }
  })();

  onMount(setMiniWindow);

  function setMiniWindow() {
    if (typeof window !== 'undefined') {
      $smallWindow = window.innerWidth < 1200;
      $miniWindow = window.innerWidth < 920;
    }
  }
</script>
