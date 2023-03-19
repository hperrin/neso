{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

{#if project && project.guid && $user}
  <div class="page-content">
    <Accordion multiple>
      <Panel bind:open={showSettings}>
        <Header>
          <h5 class="mdc-typography--body1" style="margin: 0;">
            {project.name}
          </h5>
          <IconButton slot="icon" toggle pressed={showSettings}>
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiChevronDown} />
            </Icon>
            <Icon on component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiChevronUp} />
            </Icon>
          </IconButton>
        </Header>

        <Content>
          <div class="checkbox-container">
            <FormField class="checkbox">
              <Switch bind:checked={done} on:SMUISwitch:change={handleChange} />
              <span slot="label">Mark as finished.</span>
            </FormField>
          </div>
          <div class="edit-action">
            <Button
              href="/social/project/{encodeURIComponent(project.guid)}"
              variant="outlined"
            >
              <Label>More Settings</Label>
            </Button>
          </div>
        </Content>
      </Panel>
    </Accordion>
  </div>
  <div class="page-content" style="margin-top: -2rem;">
    <Textfield
      variant="outlined"
      bind:value={text}
      label="New Todo"
      on:keydown={newTodoKeyDown}
      style="width: 100%;"
    >
      <IconButton
        slot="trailingIcon"
        style="align-self: center; margin-right: 4px;"
        on:click={newTodo}
        disabled={$loading || text === ''}
      >
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiPlusBox} />
        </Icon>
      </IconButton>
    </Textfield>
  </div>
{/if}

<script lang="ts">
  import { mdiChevronDown, mdiChevronUp, mdiPlusBox } from '@mdi/js';
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import IconButton, { Icon } from '@smui/icon-button';
  import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
  import { Svg } from '@smui/common';
  import type { SessionStuff } from '$lib/nymph';
  import { goto } from '$app/navigation';

  export let Todo: SessionStuff['Todo'];
  export let stores: SessionStuff['stores'];
  let { projects, search, user, loading } = stores;
  $: ({ projects, search, user, loading } = stores);

  $: project = $projects.find((project) =>
    $search.startsWith(`project<{Project {${project.guid}}}>`)
  );

  let failureMessage: string | undefined = undefined;
  let showSettings = false;
  let done = false;
  let text = '';

  let previousProject = project;
  $: if (project !== previousProject) {
    showSettings = false;
    done = !!project?.done;

    previousProject = project;
  }

  function handleChange() {
    // but i can't handle change...
    if (!project) {
      return;
    }

    project.done = done;

    project.$patch();
  }

  function newTodoKeyDown(event: CustomEvent | KeyboardEvent) {
    event = event as KeyboardEvent;
    if (event.key === 'Enter') {
      newTodo();
    }
  }

  async function newTodo() {
    if (project == null) {
      return;
    }

    $loading = true;
    try {
      const todo = Todo.factorySync();
      todo.text = text;
      todo.project = project;

      if (!(await todo.$save())) {
        failureMessage = 'Failed to save todo.';
      }

      text = '';
      goto(`/social/detail/${todo.guid}`);
    } catch (e: any) {
      failureMessage = e.message;
    }
    $loading = false;
  }
</script>

<style>
  .checkbox-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  * :global(.checkbox) {
    margin: 0.5rem 1rem 0;
  }

  .edit-action {
    display: flex;
    justify-content: end;
    margin-top: 1.5rem;
  }
</style>
