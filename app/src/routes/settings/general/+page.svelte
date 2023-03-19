{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<div class="page-content">
  <Paper class="settings-section">
    <Content>
      <div>
        <Wrapper>
          <Select
            bind:value={$settings.theme}
            label="Theme"
            style="width: 100%; max-width: 250px;"
            on:MDCSelect:change={save}
            disabled={$loading}
          >
            <Option value="system">Match my System</Option>
            <Option value="light">Light</Option>
            <Option value="dark">Dark</Option>
          </Select>
        </Wrapper>
      </div>

      <div style="margin-top: 1rem;">
        <Wrapper>
          <Select
            bind:value={$settings.bar}
            label="Bar Color"
            style="width: 100%; max-width: 250px;"
            on:MDCSelect:change={save}
            disabled={$loading}
          >
            <Option value="primary">Primary</Option>
            <Option value="secondary">Secondary</Option>
          </Select>
        </Wrapper>
      </div>
    </Content>
  </Paper>

  {#if $user}
    <Paper class="settings-section">
      <Title>Account Details</Title>
      <Content>
        <div>
          <Textfield
            bind:value={email}
            label="Email"
            type="email"
            style="width: 100%; max-width: 250px;"
            helperLine$style="width: 100%; max-width: 250px;"
            invalid={emailVerified === false}
            input$autocomplete="email"
            input$autocapitalize="off"
            input$spellcheck="false"
            input$emptyValueUndefined
          >
            <HelperText persistent slot="helper">
              {emailVerifiedMessage || ''}
            </HelperText>
          </Textfield>
        </div>

        <div>
          <Textfield
            bind:value={nameFirst}
            label="First Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="given-name"
            input$emptyValueUndefined
          />
        </div>

        <div>
          <Textfield
            bind:value={nameMiddle}
            label="Middle Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="additional-name"
            input$emptyValueUndefined
          />
        </div>

        <div>
          <Textfield
            bind:value={nameLast}
            label="Last Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="family-name"
            input$emptyValueUndefined
          />
        </div>

        <div class="actions">
          <Button
            on:click={saveUser}
            variant="raised"
            disabled={$loading || !userDetailsChanged}
          >
            <Label>Save Account Details</Label>
          </Button>
          <a
            href="javascript:void(0);"
            on:click={() => {
              changePasswordOpen = true;
            }}
          >
            Change your password.
          </a>
        </div>
      </Content>
    </Paper>

    <ChangePassword {User} bind:open={changePasswordOpen} bind:user={$user} />
  {/if}
</div>

<script lang="ts">
  import Paper, { Title, Content } from '@smui/paper';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import Button from '@smui/button';
  import Select, { Option } from '@smui/select';
  import { Label } from '@smui/common';
  import { ChangePassword } from '@nymphjs/tilmeld-components';
  import Wrapper from '@smui/touch-target';
  import type { PageData } from './$types';

  export let data: PageData;
  let { User, stores } = data;
  $: ({ User, stores } = data);
  let { user, settings, loading } = stores;
  $: ({ user, settings, loading } = stores);

  let failureMessage: string | undefined = undefined;
  let emailTimer: NodeJS.Timeout | undefined = undefined;
  let emailVerified: boolean | undefined = undefined;
  let emailVerifiedMessage: string | undefined = undefined;
  let changePasswordOpen = false;

  let email = $user?.email;
  let nameFirst = $user?.nameFirst;
  let nameMiddle = $user?.nameMiddle;
  let nameLast = $user?.nameLast;

  $: userDetailsChanged =
    $user &&
    (email !== $user.email ||
      nameFirst !== $user.nameFirst ||
      nameMiddle !== $user.nameMiddle ||
      nameLast !== $user.nameLast);

  $: if ($user && email !== $user.email) {
    checkEmail();
  } else {
    if (emailTimer) {
      clearTimeout(emailTimer);
    }
    emailVerified = true;
    emailVerifiedMessage = undefined;
  }

  async function save() {
    $loading = true;

    try {
      await $settings.$save();
      $settings = $settings;
      failureMessage = undefined;
    } catch (e: any) {
      failureMessage = e?.message;
    }

    $loading = false;
  }

  async function saveUser() {
    if ($user == null) {
      return;
    }

    $loading = true;

    try {
      $user.email = email;
      $user.nameFirst = nameFirst;
      $user.nameMiddle = nameMiddle;
      $user.nameLast = nameLast;
      if (await $user.$patch()) {
        email = $user?.email;
        nameFirst = $user?.nameFirst;
        nameMiddle = $user?.nameMiddle;
        nameLast = $user?.nameLast;
        failureMessage = undefined;
        emailVerifiedMessage = undefined;
      } else {
        failureMessage = 'Error saving account changes.';
      }
    } catch (e: any) {
      failureMessage = e?.message;
    }

    $loading = false;
  }

  function checkEmail() {
    emailVerified = undefined;
    emailVerifiedMessage = undefined;
    if (emailTimer) {
      clearTimeout(emailTimer);
      emailTimer = undefined;
    }
    emailTimer = setTimeout(async () => {
      if ($user == null) {
        return;
      }
      try {
        const originalEmail = $user.email;
        $user.email = email;
        const data = await $user?.$checkEmail();
        $user.email = originalEmail;
        emailVerified = data?.result ?? false;
        emailVerifiedMessage = data?.message ?? 'Error getting verification.';
      } catch (e: any) {
        emailVerified = false;
        emailVerifiedMessage = e?.message;
      }
    }, 400);
  }
</script>

<style>
  * :global(.settings-section) {
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap-reverse;
    margin-top: 1.5rem;
  }
</style>
