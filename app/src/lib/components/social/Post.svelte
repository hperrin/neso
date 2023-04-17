<Textfield
  label="New post"
  style="width: 100%;"
  textarea
  bind:value={text}
  disabled={loading}
/>

<div
  style="display: flex; margin-top: 1em; justify-content: end; align-items: center;"
>
  {#if success}
    <div>Success!</div>
  {/if}
  <Button disabled={text === '' || loading} on:click={post}>
    <Label>Post!</Label>
  </Button>
</div>

{#if failureMessage}
  <div class="app-failure">
    {failureMessage}
  </div>
{/if}

<script lang="ts">
  import Textfield from '@smui/textfield';
  import Button, { Label } from '@smui/button';
  import { AP_PUBLIC_ADDRESS } from '$lib/utils/constants.js';
  import type { SessionStuff } from '$lib/nymph.js';

  export let stuff: SessionStuff;

  let { SocialObject } = stuff;
  $: ({ SocialObject } = stuff);

  let text = '';
  let success = false;
  let loading = false;
  let failureMessage: string | undefined = undefined;

  function escapeHTML(html: string) {
    const escape = document.createElement('div');
    escape.textContent = html;
    return escape.innerHTML;
  }

  async function post() {
    loading = true;

    try {
      const object = await SocialObject.factory();

      object.to = [AP_PUBLIC_ADDRESS];
      object.type = 'Note';
      object.content = escapeHTML(text);

      if (!(await object.$send())) {
        failureMessage = "Couldn't send post.";
      } else {
        text = '';
        success = true;
        failureMessage = undefined;

        setTimeout(() => (success = false), 1500);
      }
    } catch (e: any) {
      failureMessage = e.message;
    }

    loading = false;
  }
</script>
