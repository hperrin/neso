{#if parsedApp === 'social'}
  <div class="solo-container" class:solo-container-compact={compact}>
    <Paper class="solo-paper" elevation={0}>
      {#if !compact}
        <Icon class="solo-icon" component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiMagnify} />
        </Icon>
      {/if}
      <Input
        bind:value={entitySearch}
        on:keydown={entitySearchKeyDown}
        placeholder="Search"
        class="solo-input"
      />
      {#if !compact}
        <IconButton
          class="solo-button"
          on:click={entitySearchSet}
          disabled={entitySearch === ''}
          title="Search"
          style="margin-left: 0; margin-right: 0;"
        >
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiArrowRight} />
          </Icon>
        </IconButton>
      {/if}
    </Paper>
  </div>
{:else if parsedApp === 'settings'}
  <h6 style="margin: 0;">
    {parsedApp
      .split(/\s/)
      .map((word) => word.substring(0, 1).toUpperCase() + word.substring(1))
      .join(' ')}
  </h6>
{/if}

<script lang="ts">
  import { mdiMagnify, mdiArrowRight } from '@mdi/js';
  import Paper from '@smui/paper';
  import { Input } from '@smui/textfield';
  import IconButton from '@smui/icon-button';
  import { Icon } from '@smui/common';
  import { Svg } from '@smui/common';
  import { goto } from '$app/navigation';
  import type { SessionStuff } from '$lib/nymph.js';
  import parseApp from '$lib/utils/parseApp';
  import { navigating, page } from '$app/stores';

  export let compact: boolean;
  export let stores: SessionStuff['stores'];
  let { search } = stores;
  $: ({ search } = stores);

  let entitySearch = $search;

  $: parsedApp = parseApp($page.url);

  let previousSearch = $search;
  $: if (previousSearch !== $search) {
    // Update local search when search changes.
    entitySearch = $search;
    previousSearch = $search;
  }

  let navigation = false;
  $: if ($navigating) {
    navigation = true;
  } else if (navigation) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/social/search/')
    ) {
      // Updated search to blank string if we fully navigated to a page without
      // search function.
      $search = '';
    }
    navigation = false;
  }

  function entitySearchSet() {
    goto(`/${parseApp($page.url)}/search/${encodeURIComponent(entitySearch)}`);
  }

  function entitySearchKeyDown(event: CustomEvent | KeyboardEvent) {
    event = event as KeyboardEvent;
    if (event.key === 'Enter') {
      entitySearchSet();
    }
  }
</script>
