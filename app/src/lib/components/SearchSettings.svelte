<div class="page-content page-controls">
  <div style="flex-wrap: wrap;">
    {#if showSelectionControls}
      {#each selectionSegments as segments}
        <Group variant="outlined" style="margin-inline-end: 1rem;">
          {#each segments as segment}
            <Button
              title={segment.title}
              on:click={() => segment.click()}
              variant="outlined"
            >
              <Icon component={Svg} viewBox="0 0 24 24">
                <path fill="currentColor" d={segment.icon} />
              </Icon>
              <Label>{segment.name}</Label>
            </Button>
          {/each}
        </Group>
      {/each}
    {:else}
      <SegmentedButton
        segments={readSegments}
        let:segment
        key={(segment) => segment.name}
      >
        <Segment
          {segment}
          selected={segment.value}
          on:click={() => !segment.value && goto(segment.href)}
        >
          <Icon
            component={Svg}
            style="width: 1em; height: auto;"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d={segment.icon} />
          </Icon>
          <Label>{segment.name}</Label>
        </Segment>
      </SegmentedButton>
    {/if}
  </div>

  <div>
    {#if showBulkActions}
      <div style="margin-right: 1rem;">
        <Button
          on:click={() => bulkActionMenu.setOpen(true)}
          variant="outlined"
          title="Perform bulk action on {selectedCount} todos"
        >
          <Label>{selectedCount} Selected</Label>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiMenuDown} />
          </Icon>
        </Button>
        <Menu bind:this={bulkActionMenu}>
          <List>
            {#each bulkActions as action}
              {#if 'separator' in action}
                <Separator />
              {:else}
                <Item
                  on:SMUI:action={() => {
                    if ('click' in action) {
                      action.click();
                    }
                    bulkActionMenu.setOpen(false);
                  }}
                >
                  <SelectionGroupIcon>
                    <Svg viewBox="0 0 24 24">
                      <path fill="currentColor" d={action.icon} />
                    </Svg>
                  </SelectionGroupIcon>
                  <Text>{action.name}</Text>
                </Item>
              {/if}
            {/each}
          </List>
        </Menu>
      </div>
    {:else}
      <div style="margin-right: 1rem;">
        <Button
          on:click={() => searchSortSettingsMenu.setOpen(true)}
          variant="outlined"
          title="Sort options"
        >
          <Label
            >{searchSortSettingsSegments
              .filter((segment) => segment.value)
              .map((segment) => segment.name)
              .join(', ')}</Label
          >
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiMenuDown} />
          </Icon>
        </Button>
        <Menu bind:this={searchSortSettingsMenu}>
          <List>
            {#each searchSortSettingsSegments as segment}
              {#if 'separator' in segment}
                <Separator />
              {:else}
                <Item
                  href={segment.href}
                  on:SMUI:action={() => {
                    searchSortSettingsMenu.setOpen(false);
                  }}
                  selected={segment.value}
                >
                  <SelectionGroupIcon>
                    <Svg viewBox="0 0 24 24">
                      <path fill="currentColor" d={segment.icon} />
                    </Svg>
                  </SelectionGroupIcon>
                  <Text>{segment.name}</Text>
                </Item>
              {/if}
            {/each}
          </List>
        </Menu>
      </div>
    {/if}
  </div>

  <div>
    <div style="margin-right: 1rem;">
      <Button
        on:click={() => limitMenu.setOpen(true)}
        variant="outlined"
        title="Items Per Page"
      >
        <Label>{limit}</Label>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiMenuDown} />
        </Icon>
      </Button>
      <Menu bind:this={limitMenu}>
        <List>
          <SelectionGroup>
            {#each [10, 25, 50, 100] as option}
              <Item
                on:SMUI:action={() => {
                  setLimit(option);
                  limitMenu.setOpen(false);
                }}
                selected={limit === option}
              >
                <SelectionGroupIcon>
                  <Svg viewBox="0 0 24 24">
                    <path fill="currentColor" d={mdiCheck} />
                  </Svg>
                </SelectionGroupIcon>
                <Text>{option}</Text>
              </Item>
            {/each}
          </SelectionGroup>
        </List>
      </Menu>
    </div>

    <Group variant="outlined">
      <Button
        on:click={() => setOffset(Math.max(0, offset - limit))}
        disabled={offset <= 0}
        variant="outlined"
        style="padding: 0; min-width: 36px;"
        title="Previous Page"
      >
        <Icon component={Svg} style="margin: 0;" viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiChevronLeft} />
        </Icon>
      </Button>
      <Button
        tag="div"
        on:click={() => pageInput.focus()}
        variant="outlined"
        ripple={false}
        title="Current Page"
      >
        <div>
          <Input
            type="number"
            bind:this={pageInput}
            bind:value={curPage}
            on:focus={handlePageInputFocus}
            on:blur={handlePageInputBlur}
            on:keydown={handlePageInputKeyDown}
            placeholder="Page"
            class="page-input"
          />
        </div>
      </Button>
      <Button
        on:click={() => setOffset(offset + limit)}
        disabled={$searchResults.length < limit}
        variant="outlined"
        style="padding: 0; min-width: 36px;"
        title="Next Page"
      >
        <Icon component={Svg} style="margin: 0;" viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiChevronRight} />
        </Icon>
      </Button>
    </Group>
  </div>
</div>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    mdiCheckboxMultipleBlank,
    mdiClipboard,
    mdiClipboardCheck,
    mdiSortClockAscending,
    mdiSortClockDescending,
    mdiChevronLeft,
    mdiChevronRight,
    mdiMenuDown,
    mdiCheck,
    mdiCheckboxMultipleMarked,
    mdiDeleteSweep,
  } from '@mdi/js';
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import Button, { Group } from '@smui/button';
  import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
  import List, { Item, Text, Separator } from '@smui/list';
  import { Input } from '@smui/textfield';
  import { Icon, Label } from '@smui/common';
  import { Svg } from '@smui/common';
  import { goto } from '$app/navigation';
  import type { SessionStuff } from '$lib/nymph';

  const dispatch = createEventDispatcher();

  export let showSelectionControls = false;
  export let showBulkActions = false;
  export let selectedCount = 0;
  export let stores: SessionStuff['stores'];
  let { search, searchResults } = stores;
  $: ({ search, searchResults } = stores);

  $: pendingAndFinished = !!$search.match(
    /(?:^| )\(\| \[done\] \[!done\]\)(?:$| )/
  );
  $: finished =
    !pendingAndFinished && !!$search.match(/(?:^| )\[done\](?:$| )/);

  $: readSegments = [
    {
      name: 'All',
      icon: mdiCheckboxMultipleBlank,
      value: pendingAndFinished,
      href: `/social/search/${encodeURIComponent(
        $search
          .replace(/(?:^| )\(\| \[done\] \[!done\]\)($| )/g, '$1')
          .replace(/(?:^| )\[!?done\]($| )/g, '$1') + ' (| [done] [!done])'
      )}`,
    },
    {
      name: 'Pending',
      icon: mdiClipboard,
      value: !finished && !pendingAndFinished,
      href: `/social/search/${encodeURIComponent(
        $search
          .replace(/(?:^| )\(\| \[done\] \[!done\]\)($| )/g, '$1')
          .replace(/(?:^| )\[!?done\]($| )/g, '$1')
      )}`,
    },
    {
      name: 'Finished',
      icon: mdiClipboardCheck,
      value: finished,
      href: `/social/search/${encodeURIComponent(
        $search
          .replace(/(?:^| )\(\| \[done\] \[!done\]\)($| )/g, '$1')
          .replace(/(?:^| )\[!?done\]($| )/g, '$1') + ' [done]'
      )}`,
    },
  ];
  let selectionSegments = [
    [
      {
        name: 'All',
        icon: mdiCheckboxMultipleMarked,
        title: 'Select all todos on this screen.',
        click: () => {
          dispatch('select', 'all');
        },
      },
      {
        name: 'None',
        title: 'Unselect all selected todos.',
        icon: mdiCheckboxMultipleBlank,
        click: () => {
          dispatch('select', 'none');
        },
      },
    ],
  ];

  let searchSortSettingsMenu: Menu;

  $: oldestFirst = !!$search.match(/(?:^| )reverse:(?:false|0)(?:$| )/);

  $: searchSortSettingsSegments = [
    {
      name: 'Newest First',
      icon: mdiSortClockDescending,
      value: !oldestFirst,
      href: `/social/search/${encodeURIComponent(
        $search.replace(/(?:^| )reverse:(?:true|false|1|0)($| )/g, '$1')
      )}`,
    },
    {
      name: 'Oldest First',
      icon: mdiSortClockAscending,
      value: oldestFirst,
      href: `/social/search/${encodeURIComponent(
        $search.replace(/(?:^| )reverse:(?:true|false|1|0)($| )/g, '$1') +
          ' reverse:false'
      )}`,
    },
  ];

  let bulkActionMenu: Menu;
  let bulkActions: (
    | { separator: true }
    | { name: string; icon: string; click: () => void }
  )[] = [
    {
      name: 'Mark as Done',
      icon: mdiCheckboxMultipleMarked,
      click: () => {
        dispatch('action', 'mark-as-done');
      },
    },
    {
      name: 'Mark as Pending',
      icon: mdiCheckboxMultipleBlank,
      click: () => {
        dispatch('action', 'mark-as-pending');
      },
    },
    {
      separator: true,
    },
    {
      name: 'Delete',
      icon: mdiDeleteSweep,
      click: () => {
        dispatch('action', 'delete');
      },
    },
  ];

  let limitMenu: Menu;
  $: limit = Number(
    ($search.match(/(?:^| )limit:(\d+)(?:$| )/) || [null, 25])[1]
  );

  function setLimit(newLimit: number) {
    if (limit === newLimit) {
      return;
    }

    goto(
      `/social/search/${encodeURIComponent(
        $search.replace(/(?:^| )limit:(?:\d+)($| )/g, '$1') +
          (newLimit === 25 ? '' : ` limit:${newLimit}`)
      )}`
    );
  }

  $: offset = Number(
    ($search.match(/(?:^| )offset:(\d+)(?:$| )/) || [null, 0])[1]
  );

  function setOffset(newOffset: number) {
    if (offset === newOffset) {
      return;
    }

    goto(
      `/social/search/${encodeURIComponent(
        $search.replace(/(?:^| )offset:(?:\d+)($| )/g, '$1') +
          (newOffset === 0 ? '' : ` offset:${newOffset}`)
      )}`
    );
  }

  let pageInput: Input;
  $: curPage = Math.max(1, Math.floor(offset / limit) + 1);

  function handlePageInputFocus(event: FocusEvent) {
    if (event.currentTarget) {
      (event.currentTarget as HTMLInputElement).select();
    }
  }

  function handlePageInputBlur() {
    setOffset((curPage - 1) * limit);
  }

  function handlePageInputKeyDown(event: CustomEvent | KeyboardEvent) {
    event = event as KeyboardEvent;

    if (event.key === 'Enter') {
      setOffset((curPage - 1) * limit);
    }
  }
</script>

<style>
  * :global(.page-input) {
    text-align: end;
    width: 30px;
    color: var(--mdc-theme-on-surface, #000);
    -moz-appearance: textfield;
  }

  * :global(.page-input::-webkit-outer-spin-button),
  * :global(.page-input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
