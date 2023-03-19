{#key todo.guid}
  {#if failureMessage}
    <div class="app-failure">
      {failureMessage}
    </div>
  {/if}

  {#if todo}
    <div class="page-content">
      <Paper class="todo-paper" variant="raised">
        <Title
          >{#if todo.done}Finished {/if}Todo in {todo.project.name}</Title
        >
        <Subtitle>
          <span title={new Date(todo.cdate || 0).toLocaleString()}
            ><RelativeDate
              date={todo.cdate}
              dateStyle="wymd"
              timeStyle="hm"
              length="short"
            /></span
          >
        </Subtitle>

        <Content>
          <Textfield
            bind:value={text}
            label="Text"
            required
            style="width: 100%;"
          />

          <div class="checkbox-container">
            <FormField>
              <Switch bind:checked={done} />
              <span slot="label">Mark this task as done.</span>
            </FormField>
          </div>

          <div class="actions">
            <div>
              <Button
                on:click={save}
                variant="raised"
                disabled={$loading || !dirty || text.trim() === ''}
              >
                <Label>Save</Label>
              </Button>
            </div>
            <div>
              <Button
                on:click={confirmDelete}
                color="secondary"
                disabled={$loading}
              >
                <Label>Delete</Label>
              </Button>
            </div>
          </div>
        </Content>
      </Paper>
    </div>

    <Dialog
      bind:open={deleteConfirmationDialogOpen}
      aria-labelledby="delete-confirmation-title"
      aria-describedby="delete-confirmation-content"
      on:SMUIDialog:closed={deleteConfirmationDialogCloseHandler}
    >
      <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
      <DialogTitle id="delete-confirmation-title">Delete Todo</DialogTitle>
      <DialogContent id="delete-confirmation-content"
        >Do you want to delete this todo? This cannot be undone.</DialogContent
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
  {/if}
{/key}

<script lang="ts">
  import type { PubSubSubscription } from '@nymphjs/client';
  import type { TodoClass, TodoData } from '$lib/nymph';
  import { onMount, onDestroy } from 'svelte';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import Dialog, {
    Title as DialogTitle,
    Content as DialogContent,
    Actions,
  } from '@smui/dialog';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;
  let { stores, pubsub, todo } = data;
  $: ({ stores, pubsub, todo } = data);
  let { loading } = stores;
  $: ({ loading } = stores);

  let subscription: PubSubSubscription<TodoClass & TodoData>;
  let failureMessage: string | undefined = undefined;
  let text = todo.text;
  let done = !!todo.done;
  let deleteConfirmationDialogOpen = false;

  $: dirty = text !== todo.text || done !== todo.done;

  onMount(subscribe);
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  function subscribe() {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = pubsub.subscribeWith(
      todo,
      () => {
        todo = todo;
        failureMessage = undefined;
      },
      (err) => {
        failureMessage = err?.message;
      }
    );
  }

  async function save() {
    todo.text = text;
    todo.done = done;
    $loading = true;
    try {
      if (!(await todo.$save())) {
        failureMessage = 'Failed to save todo.';
      }
      await todo.$readyAll(1);
      goto(`/social/detail/${todo.guid}`);
    } catch (e: any) {
      failureMessage = e.message;
    }
    $loading = false;
  }

  function confirmDelete() {
    deleteConfirmationDialogOpen = true;
  }

  async function deleteConfirmationDialogCloseHandler() {
    $loading = true;
    deleteConfirmationDialogOpen = false;
    try {
      if (!(await todo.$delete())) {
        failureMessage = 'Failed to delete todo.';
      }
      goto(`/social/search/${encodeURIComponent(`[!done]`)}`);
    } catch (e: any) {
      failureMessage = e.message;
    }
    $loading = false;
  }
</script>

<style>
  .checkbox-container {
    display: flex;
    flex-direction: column;
    margin-top: 1em;
  }

  @media (max-width: 420px) {
    .checkbox-container {
      margin-bottom: 1em;
    }
  }

  .actions {
    margin-top: 1rem;
    min-width: 100px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }
</style>
