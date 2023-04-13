{#if $user}
  <Paper>
    <Title>Authorization Request</Title>
    <Subtitle
      ><strong>{$user.name}</strong>, an app wants access to your account.</Subtitle
    >
    <Content>
      {#if submitted}
        You have approved the request. You may now return to the application.
      {:else}
        <strong>{client.name}</strong> would like permission to access your
        account. This app is not affiliated with Neso, so you should not approve
        it unless you trust it.

        <h5>Review Permissions</h5>

        <List twoLine avatarList nonInteractive>
          {#each requestedPermission as item}
            <Item>
              <Graphic>
                <Icon component={Svg} viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiCheck} />
                </Icon>
              </Graphic>

              <Text>
                <PrimaryText>{item.title}</PrimaryText>
                <SecondaryText>{item.description}</SecondaryText>
              </Text>
            </Item>
          {/each}
        </List>

        <form
          action="/oauth/authorize"
          method="POST"
          style="margin-top: 1em;"
          on:submit={handleSubmit}
        >
          <input type="hidden" name="scope" value={scopes.join(' ')} />
          <input
            type="hidden"
            name="response_type"
            value={$page.url.searchParams.get('response_type')}
          />
          <input
            type="hidden"
            name="redirect_uri"
            value={$page.url.searchParams.get('redirect_uri')}
          />
          <input
            type="hidden"
            name="client_id"
            value={$page.url.searchParams.get('client_id')}
          />
          <input
            type="hidden"
            name="state"
            value={$page.url.searchParams.get('state')}
          />
          <Button variant="raised" style="width: 100%;">
            <Label>Approve</Label>
          </Button>
        </form>
        <Button
          href="/oauth/deny"
          variant="raised"
          color="secondary"
          style="width: 100%; margin-top: 1em;"
        >
          <Label>Deny</Label>
        </Button>
      {/if}
    </Content>
  </Paper>
{/if}

<script lang="ts">
  import { mdiCheck } from '@mdi/js';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';
  import List, {
    Item,
    Graphic,
    Text,
    PrimaryText,
    SecondaryText,
  } from '@smui/list';
  import Button, { Label } from '@smui/button';
  import { Icon } from '@smui/common';
  import { Svg } from '@smui/common';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;
  let { stores, client } = data;
  $: ({ stores, client } = data);
  let { user } = stores;
  $: ({ user } = stores);

  let submitted = false;

  const permissions: { [k: string]: { title: string; description: string } } = {
    read: {
      title: 'Read Account Data',
      description: 'Read all your data except your password.',
    },
    write: {
      title: 'Write Account Data',
      description: 'Create, edit, and delete data in your account.',
    },
    follow: {
      title: 'Modify Follows, Mutes, and Blocks',
      description: 'Edit who you follow, mute, and block.',
    },
  };

  const scopes = ($page.url.searchParams.get('scope') || '')
    .split(' ')
    .filter((scope) => scope in permissions);
  const requestedPermission: { title: string; description: string }[] =
    scopes.map((scope) => permissions[scope]);

  function handleSubmit() {
    requestAnimationFrame(() => {
      submitted = true;
    });
    return true;
  }
</script>
