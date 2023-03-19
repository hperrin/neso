{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<div class="view-container">
  <div class="list-container" bind:this={listContainer}>
    <ProjectQuickSettings {Todo} {stores} />

    <SearchSettings
      {stores}
      showSelectionControls={hasSelection}
      showBulkActions={hasSelection}
      {selectedCount}
      on:select={handleSelection}
      on:action={handleBulkAction}
    />

    <List
      tag="div"
      avatarList={!!$searchResults.length}
      nonInteractive={!$searchResults.length}
    >
      {#each $searchResults as todo (todo.guid)}
        <Item
          tag="a"
          href={`/social/detail/${encodeURIComponent(todo.guid || '')}`}
          selected={$page.params.guid === todo.guid}
          activated={!todo.done}
          draggable="true"
          on:dragstart={(event) => handleTodoDragStart(event, todo)}
          on:keydown={(event) => handleTodoKeydown(event, todo)}
          style="cursor: pointer;"
        >
          <Graphic on:click={(event) => handleTodoGraphicClick(event, todo)}>
            <Checkbox checked={todo.guid != null && todo.guid in checkedTodo} />
          </Graphic>
          <Text style={todo.done ? '' : 'font-weight: bold;'}>
            {todo.text}
          </Text>
          <Meta class="ellipsis">
            <span title={new Date(todo.cdate || 0).toLocaleString()}
              ><RelativeDate date={todo.cdate} /></span
            >
          </Meta>
        </Item>
      {:else}
        <Item nonInteractive>
          <Text>Nothing was found that matches the search query.</Text>
        </Item>
      {/each}
    </List>
  </div>
</div>

<Dialog
  bind:open={deleteConfirmationDialogOpen}
  aria-labelledby="delete-confirmation-title"
  aria-describedby="delete-confirmation-content"
  on:SMUIDialog:closed={deleteConfirmationDialogCloseHandler}
>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title id="delete-confirmation-title">Delete Todo(s)</Title>
  <Content id="delete-confirmation-content"
    >Do you want to delete {Object.values(checkedTodo).length} selected todo(s)?
    This cannot be undone.</Content
  >
  <Actions>
    <Button action="cancel">
      <Label>Cancel</Label>
    </Button>
    <Button action="delete">
      <Label>Delete</Label>
    </Button>
  </Actions>
</Dialog>

<script lang="ts">
  import { onMount, onDestroy, setContext } from 'svelte';
  import type { PubSubSubscription, PubSubUpdate } from '@nymphjs/client';
  import List, { Item, Graphic, Meta, Text } from '@smui/list';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import { navigating, page } from '$app/stores';
  import type { TodoClass, TodoData } from '$lib/nymph';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import ProjectQuickSettings from '$lib/components/ProjectQuickSettings.svelte';
  import SearchSettings from '$lib/components/SearchSettings.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { pubsub, nymph, stores, Todo, subscribable } = data;
  $: ({ pubsub, nymph, stores, Todo, subscribable } = data);
  let { loading, searchResults } = stores;
  $: ({ loading, searchResults } = stores);

  let subscription: PubSubSubscription<PubSubUpdate<(TodoClass & TodoData)[]>>;
  let failureMessage: string | undefined = undefined;
  let listContainer: HTMLDivElement;
  let contentContainer: HTMLDivElement;
  let checkedTodo: { [k: string]: TodoClass & TodoData } = {};
  let deleteConfirmationDialogOpen = false;

  $: selectedCount = Object.keys(checkedTodo).length;
  $: hasSelection = !!selectedCount;

  // Scroll to the top when the user changes the search query.
  let scrollNextNavigation = false;
  $: if (
    $navigating &&
    (!$navigating.to?.route.id?.startsWith('/social/search/[query]') ||
      $navigating.from?.params?.query !== $navigating.to?.params?.query)
  ) {
    scrollNextNavigation = true;
  }
  $: if (listContainer && $navigating == null && scrollNextNavigation) {
    listContainer.scrollTop = 0;
    scrollNextNavigation = false;
  }
  $: if (contentContainer && $navigating == null) {
    contentContainer.scrollTop = 0;
  }

  let previousSubscribable = subscribable;
  $: if (subscribable !== previousSubscribable) {
    subscribe();
    previousSubscribable = subscribable;
  }

  onMount(subscribe);
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  function subscribe() {
    $loading = true;

    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = subscribable(
      (update) => {
        pubsub.updateArray($searchResults, update);
        $searchResults = $searchResults;
        $loading = false;
        failureMessage = undefined;
      },
      (err) => {
        $loading = false;
        failureMessage = err?.message || 'An error occurred.';
      }
    );
  }

  function handleTodoDragStart(
    event: CustomEvent | DragEvent,
    todo: TodoClass & TodoData
  ) {
    event = event as DragEvent;

    if (event.dataTransfer && todo.guid) {
      event.dataTransfer.setData('x-nymph/todo', todo.guid);
    }
  }

  function handleTodoKeydown(
    event: CustomEvent | KeyboardEvent,
    todo: TodoClass & TodoData
  ) {
    event = event as KeyboardEvent;

    if (event.key === ' ') {
      toggleTodoChecked(todo);
      checkedTodo = checkedTodo;
    }
  }

  function handleTodoGraphicClick(
    event: CustomEvent | MouseEvent,
    todo: TodoClass & TodoData
  ) {
    event = event as MouseEvent;

    window.requestAnimationFrame(() => {
      // I don't know why this needs to be in a RAF.
      toggleTodoChecked(todo);
      checkedTodo = checkedTodo;
    });

    event.preventDefault();
    event.stopPropagation();
  }

  function toggleTodoChecked(todo: TodoClass & TodoData) {
    if (todo.guid == null) {
      return;
    }
    if (todo.guid in checkedTodo) {
      delete checkedTodo[todo.guid];
    } else {
      checkedTodo[todo.guid] = todo;
    }
  }

  function handleSelection(event: CustomEvent<string>) {
    switch (event.detail) {
      case 'all':
        $searchResults.forEach((todo) => {
          if (todo.guid != null) {
            checkedTodo[todo.guid] = todo;
          }
        });
        break;
      case 'none':
        checkedTodo = {};
        break;
    }
    checkedTodo = checkedTodo;
  }

  async function performBulkAction(
    edit: (todo: TodoClass & TodoData) => (TodoClass & TodoData) | null
  ) {
    $loading = true;
    try {
      const todos = Object.values(checkedTodo)
        .map(edit)
        .filter((todo) => todo != null) as (TodoClass & TodoData)[];
      while (todos.length) {
        const chunk = todos.splice(0, 20);
        if (!(await nymph.saveEntities(chunk))) {
          failureMessage = 'Bulk action failed.';
        }
      }
    } catch (e: any) {
      failureMessage = e.message;
    }
    $loading = false;
  }

  async function performBulkDelete() {
    $loading = true;
    try {
      const todos = Object.values(checkedTodo).filter(
        (todo) => todo != null
      ) as (TodoClass & TodoData)[];
      while (todos.length) {
        const chunk = todos.splice(0, 20);
        if (!(await nymph.deleteEntities(chunk))) {
          failureMessage = 'Bulk action failed.';
        }
      }
    } catch (e: any) {
      failureMessage = e.message;
    }
    $loading = false;
  }

  async function handleBulkAction(event: CustomEvent<string>) {
    switch (event.detail) {
      case 'mark-as-done':
        await performBulkAction((todo) => {
          if (!todo.done) {
            todo.done = true;
            return todo;
          }
          return null;
        });
        break;
      case 'mark-as-pending':
        await performBulkAction((todo) => {
          if (todo.done) {
            todo.done = false;
            return todo;
          }
          return null;
        });
        break;
      case 'delete':
        deleteConfirmationDialogOpen = true;
        break;
    }
  }

  function deleteConfirmationDialogCloseHandler(
    e: CustomEvent<{ action: string }>
  ) {
    deleteConfirmationDialogOpen = false;
    switch (e.detail.action) {
      case 'delete':
        performBulkDelete();
        break;
      default:
        break;
    }
  }
</script>

<style>
  .view-container {
    display: flex;
    height: 100%;
  }

  .list-container {
    padding: 1rem;
    justify-content: center;
    flex-grow: 1;
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
  }

  * :global(.ellipsis) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
