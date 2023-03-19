<AppDrawerLayout {stores}>
  <List class="app-drawer-list" slot="drawer">
    <Item
      draggable="false"
      href="/social/feed"
      activated={$page.route.id === '/social/feed'}
      title="Posts from accounts and hashtags you follow"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiHome} />
        </Icon>
      </Graphic>
      <Text>Feed</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/notifications"
      activated={$page.route.id === '/social/notifications'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiBell} />
        </Icon>
      </Graphic>
      <Text>Notifications</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/trending"
      activated={$page.route.id === '/social/trending'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiTrendingUp} />
        </Icon>
      </Graphic>
      <Text>Trending</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/local"
      activated={$page.route.id === '/social/local'}
      title="Posts from users on this server"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiAccountGroup} />
        </Icon>
      </Graphic>
      <Text>Local</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/global"
      activated={$page.route.id === '/social/global'}
      title="Posts from all federated servers this server can see"
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiEarth} />
        </Icon>
      </Graphic>
      <Text>Global</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/favorites"
      activated={$page.route.id === '/social/favorites'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiStar} />
        </Icon>
      </Graphic>
      <Text>Favorites</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/bookmarks"
      activated={$page.route.id === '/social/bookmarks'}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiBookmark} />
        </Icon>
      </Graphic>
      <Text>Bookmarks</Text>
    </Item>

    <Separator />
    <Item
      draggable="false"
      href="/social/search/{encodeURIComponent(`[!done]`)}"
      activated={$search.startsWith(`[!done]`)}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiClipboard} />
        </Icon>
      </Graphic>
      <Text>Pending</Text>
    </Item>
    <Item
      draggable="false"
      href="/social/search/{encodeURIComponent(`[done]`)}"
      activated={$search.startsWith(`[done]`)}
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiClipboardCheck} />
        </Icon>
      </Graphic>
      <Text>Finished</Text>
    </Item>

    <Separator />
    <Item
      on:dragenter={(event) => handleProjectDragEnterOrOver(event)}
      on:dragover={(event) => handleProjectDragEnterOrOver(event)}
      on:drop={(event) => handleProjectDrop(event)}
      nonInteractive
    >
      <Graphic>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiClipboardList} />
        </Icon>
      </Graphic>
      <Text class="mdc-typography--body2">Projects</Text>
      <Meta>
        <IconButton
          href="/social/project/+"
          style="color: unset;"
          title="New project"
          size="button"
        >
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiPlus} />
          </Icon>
        </IconButton>
      </Meta>
    </Item>

    {#if failureMessage}
      <Item nonInteractive>
        <Text class="app-failure">
          {failureMessage}
        </Text>
      </Item>
    {/if}

    {#each $projects as project, i (project.guid)}
      <Item
        draggable={$loading ? 'false' : 'true'}
        on:dragstart={(event) => handleProjectDragStart(event, project)}
        on:dragenter={(event) => handleProjectDragEnterOrOver(event, project)}
        on:dragover={(event) => handleProjectDragEnterOrOver(event, project)}
        on:drop={(event) => handleProjectDrop(event, project)}
        href="/social/search/{encodeURIComponent(
          `project<{Project {${project.guid}}}>`
        )}"
        activated={project.$is(activeProject)}
        style="position: relative; {project.$level
          ? `margin-left: ${(project.$level + 1) * 8}px;`
          : ''} {visibleProjects[project.guid || ''] ? '' : 'display: none;'}"
        aria-controlledby={project.parent
          ? `project-expansion-button-${project.parent.guid}`
          : undefined}
      >
        {#if i + 1 in $projects && project.$is($projects[i + 1].parent)}
          <Graphic style="margin-right: 8px; pointer-events: all;">
            <IconButton
              on:click={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              toggle
              bind:pressed={openProjects[project.guid || '']}
              title={openProjects[project.guid || ''] ? 'Collapse' : 'Expand'}
              size="button"
              id="project-expansion-button-{project.guid}"
              aria-expanded={openProjects[project.guid || '']
                ? 'true'
                : 'false'}
              aria-pressed={null}
            >
              <Icon component={Svg} viewBox="0 0 24 24" on>
                <path fill="currentColor" d={mdiChevronUp} />
              </Icon>
              <Icon component={Svg} viewBox="0 0 24 24">
                <path fill="currentColor" d={mdiChevronDown} />
              </Icon>
            </IconButton>
          </Graphic>
        {/if}
        <Text>
          {project.name}
        </Text>
        {#if $search.startsWith(`project<{Project {${project.guid}}}>`)}
          <Meta>
            <IconButton
              on:click={(event) => {
                event.preventDefault();
                project.guid &&
                  goto(`/social/project/${encodeURIComponent(project.guid)}`);
              }}
              title="Edit project"
              size="button"
            >
              <Icon component={Svg} viewBox="0 0 24 24">
                <path fill="currentColor" d={mdiPencil} />
              </Icon>
            </IconButton>
          </Meta>
        {/if}
      </Item>
    {:else}
      <Item nonInteractive>
        <Text>You don't have any projects.</Text>
      </Item>
    {/each}
  </List>

  <slot />
</AppDrawerLayout>

<script lang="ts">
  import {
    mdiHome,
    mdiBell,
    mdiTrendingUp,
    mdiAccountGroup,
    mdiEarth,
    mdiStar,
    mdiBookmark,
    mdiClipboardList,
    mdiClipboard,
    mdiPlus,
    mdiClipboardCheck,
    mdiPencil,
    mdiChevronUp,
    mdiChevronDown,
  } from '@mdi/js';
  import IconButton from '@smui/icon-button';
  import List, { Item, Text, Graphic, Meta, Separator } from '@smui/list';
  import { Icon, Svg } from '@smui/common';
  import AppDrawerLayout from '$lib/components/AppDrawerLayout.svelte';
  import type { ProjectClass, ProjectData } from '$lib/nymph';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  let { stores, Todo } = data;
  $: ({ stores, Todo } = data);
  let { projects, search, loading } = stores;
  $: ({ projects, search, loading } = stores);

  let failureMessage: string | undefined = undefined;
  let openProjects: { [k: string]: boolean } = {};

  $: activeProject = [...$projects].find((project) =>
    $search.startsWith(`project<{Project {${project.guid}}}>`)
  );

  $: $projects.forEach((project) => {
    if (project.guid == null) {
      return;
    }
    if (!(project.guid in openProjects)) {
      openProjects[project.guid] = false;
    }
  });
  $: visibleProjects = openProjects
    ? Object.fromEntries(
        $projects.map((project) => [project.guid, isProjectVisible(project)])
      )
    : {};

  function handleProjectDragStart(
    event: CustomEvent | DragEvent,
    project: ProjectClass & ProjectData
  ) {
    event = event as DragEvent;

    if (event.dataTransfer && project.guid) {
      event.dataTransfer.setData('x-nymph/project', project.guid);
    }
  }

  function handleProjectDragEnterOrOver(
    event: CustomEvent | DragEvent,
    project?: ProjectClass & ProjectData
  ) {
    event = event as DragEvent;

    if (event.dataTransfer) {
      if (event.dataTransfer.getData('x-nymph/project')) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
      } else if (event.dataTransfer.getData('x-nymph/todo')) {
        if (!project || project.$is(activeProject)) {
          return;
        }
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
      }
    }
  }

  async function handleProjectDrop(
    event: CustomEvent | DragEvent,
    project?: ProjectClass & ProjectData
  ) {
    event = event as DragEvent;

    if (event.dataTransfer) {
      if (event.dataTransfer.getData('x-nymph/project')) {
        const guid = event.dataTransfer.getData('x-nymph/project');
        const child = $projects.find((project) => project.guid === guid);

        if (child == null) {
          return false;
        }

        event.preventDefault();

        $loading = true;
        try {
          if (project) {
            child.parent = project;
          } else {
            delete child.parent;
          }

          await child.$patch();
          failureMessage = undefined;
        } catch (e: any) {
          failureMessage = e?.message;
          // Refresh on failure, since the change didn't take.
          await child.$refresh();
        }
        $loading = false;
      } else if (event.dataTransfer.getData('x-nymph/todo')) {
        const guid = event.dataTransfer.getData('x-nymph/todo');
        const todo = await Todo.factory(guid);

        if (!project || !todo.guid) {
          return;
        }

        $loading = true;
        try {
          todo.project = project;

          await todo.$patch();
          failureMessage = undefined;
        } catch (e: any) {
          failureMessage = e?.message;
          // Refresh on failure, since the change didn't take.
          await todo.$refresh();
        }
        $loading = false;
      }
    }
  }

  function isProjectVisible(project: ProjectClass & ProjectData) {
    if (project.parent == null) {
      return true;
    }
    let parent = $projects.find((curProject) => curProject.$is(project.parent));
    if (!parent) {
      return true;
    }
    do {
      if (parent.guid == null) {
        return true;
      }
      if (!openProjects[parent.guid]) {
        return false;
      }
      parent = parent.parent
        ? $projects.find(
            (curProject) => parent && curProject.$is(parent.parent)
          )
        : undefined;
    } while (parent);
    return true;
  }
</script>
