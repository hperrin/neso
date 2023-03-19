<AppDrawerLayout {stores}>
  <List class="app-drawer-list" slot="drawer">
    {#each tabs as tab}
      <Item href="/settings/{tab.route}" activated={tab === active}>
        <Graphic>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={tab.icon} />
          </Icon>
        </Graphic>
        <Text>{tab.label}</Text>
      </Item>
    {/each}
  </List>

  <slot />
</AppDrawerLayout>

<script lang="ts">
  import { mdiTuneVerticalVariant, mdiClipboardCheckMultiple } from '@mdi/js';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { Icon } from '@smui/common';
  import { Svg } from '@smui/common';
  import AppDrawerLayout from '$lib/components/AppDrawerLayout.svelte';
  import { page, navigating } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  let { stores } = data;
  $: ({ stores } = data);

  let tabs = [
    {
      route: 'general',
      label: 'General',
      icon: mdiTuneVerticalVariant,
    },
    {
      route: 'finished-projects',
      label: 'Finished Projects',
      icon: mdiClipboardCheckMultiple,
    },
  ];

  let active: { route: string; label: string } | undefined = tabs.find((tab) =>
    $page.url.pathname.startsWith('/settings/' + tab.route)
  );

  $: if ($navigating) {
    active = tabs.find((tab) =>
      $navigating?.to?.url.pathname.startsWith('/settings/' + tab.route)
    );
  }
</script>
