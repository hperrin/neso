<div class="app-buttons">
  <Button
    title="Social"
    href={parsedApp === 'social' ? undefined : '/social/'}
    disabled={parsedApp === 'social'}
    variant={parsedApp === 'social' ? 'raised' : 'text'}
    style="height: 64px;"
  >
    <Icon
      component={Svg}
      viewBox="0 0 24 24"
      style="height: 28px; width: 28px; margin: 0;"
    >
      <path fill="currentColor" d={mdiAccountGroup} />
    </Icon>
  </Button>
  <Button
    title="Settings"
    href={parsedApp === 'settings' ? undefined : '/settings/general'}
    disabled={parsedApp === 'settings'}
    variant={parsedApp === 'settings' ? 'raised' : 'text'}
    style="height: 64px;"
  >
    <Icon
      component={Svg}
      viewBox="0 0 24 24"
      style="height: 28px; width: 28px; margin: 0;"
    >
      <path fill="currentColor" d={mdiCog} />
    </Icon>
  </Button>
</div>

<script lang="ts">
  import { mdiAccountGroup, mdiCog } from '@mdi/js';
  import Button, { Icon } from '@smui/button';
  import { Svg } from '@smui/common';
  import parseApp from '$lib/utils/parseApp';
  import { page } from '$app/stores';

  $: parsedApp = parseApp($page.url);
</script>

<style>
  .app-buttons {
    display: flex;
    align-content: center;
    justify-content: center;
  }

  .app-buttons > :global(*) {
    margin: 10px 0 10px 10px;
    padding: 0;
    flex-grow: 1;
  }

  .app-buttons > :global(*:last-child) {
    margin-right: 10px;
  }
</style>
