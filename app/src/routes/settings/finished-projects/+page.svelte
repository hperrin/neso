<div class="page-content">
  <Paper class="settings-section">
    <Subtitle>These are projects you've marked as done.</Subtitle>
    <Content>
      <List>
        {#each projects as project, i (project.guid)}
          {#if i > 0}
            <Separator />
          {/if}
          <Item nonInteractive>
            <Text>
              {project.name}
            </Text>
            <Meta style="white-space: nowrap;">
              <IconButton
                href={`/social/search/${encodeURIComponent(
                  `project<{Project {${project.guid}}}> (| [done] [!done])`
                )}`}
                title="View this project's todos."
                style="color: unset;"
              >
                <Icon component={Svg} viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiClipboardSearch} />
                </Icon>
              </IconButton>
              <IconButton
                href={`/social/project/${encodeURIComponent(
                  project.guid || ''
                )}`}
                title="Edit this project (you can mark it as not finished from here)."
                style="color: unset;"
              >
                <Icon component={Svg} viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiPencil} />
                </Icon>
              </IconButton>
            </Meta>
          </Item>
        {:else}
          <Item nonInteractive>
            <Text>You haven't finished any projects.</Text>
          </Item>
        {/each}
      </List>
    </Content>
  </Paper>
</div>

<script lang="ts">
  import { mdiClipboardSearch, mdiPencil } from '@mdi/js';
  import Paper, { Subtitle, Content } from '@smui/paper';
  import List, { Item, Meta, Text, Separator } from '@smui/list';
  import IconButton, { Icon } from '@smui/icon-button';
  import { Svg } from '@smui/common';
  import type { PageData } from './$types';

  export let data: PageData;
  let { projects } = data;
  $: ({ projects } = data);
</script>

<style>
  * :global(.settings-section) {
    margin-bottom: 1rem;
  }
</style>
