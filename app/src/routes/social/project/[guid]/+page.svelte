{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<div class="page-content">
  <Paper>
    <Title>Editing {project.guid ? project.name : 'New Project'}</Title>
    {#if project.done}
      <Subtitle>This project is marked done.</Subtitle>
    {/if}
    <Content>
      <Textfield bind:value={name} label="Name" required />

      <div class="checkbox-container">
        <FormField>
          <Switch bind:checked={done} />
          <span slot="label">Mark this project as done.</span>
        </FormField>
      </div>

      <div class="actions">
        <div>
          <Button
            on:click={save}
            variant="raised"
            disabled={$loading || !dirty || name.trim() === ''}
          >
            <Label>{project.guid != null ? 'Save' : 'Create'}</Label>
          </Button>
        </div>
        {#if project.guid != null}
          <div>
            <Button
              on:click={confirmDelete}
              color="secondary"
              disabled={$loading}
            >
              <Label>Delete</Label>
            </Button>
          </div>
        {/if}
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
  <DialogTitle id="delete-confirmation-title">Delete Project</DialogTitle>
  <DialogContent id="delete-confirmation-content"
    >Do you want to delete this project? This will also delete all todos in this
    project. This cannot be undone.</DialogContent
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
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;
  let { stores, project } = data;
  $: ({ stores, project } = data);
  let { loading } = stores;
  $: ({ loading } = stores);

  let failureMessage: string | undefined = undefined;
  let name = project.name;
  let done = !!project.done;
  let deleteConfirmationDialogOpen = false;

  $: dirty = name !== project.name || done !== project.done;

  async function save() {
    project.name = name;
    project.done = done;
    $loading = true;
    try {
      if (!(await project.$save())) {
        failureMessage = 'Failed to save project.';
      }
      goto(`/social/project/${project.guid}`);
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
      if (!(await project.$delete())) {
        failureMessage = 'Failed to delete project.';
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
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
  }
</style>
