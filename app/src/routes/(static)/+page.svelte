{#if $loading || $user}
  <div
    style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 0;"
  >
    <CircularProgress indeterminate style="height: 80px; width: 80px;" />
    Loading...
  </div>
{:else}
  <div class="intro-container" style="min-width: 320px;">
    <h1>Neso</h1>
    <p>
      Join Neso to gain access to the largest federated social network in the
      world. Neso uses ActivityPub to work with Mastodon, PixelFed, Pleroma,
      PeerTube, and more! (It's a <a
        href="https://hack.sveltesociety.dev/"
        target="_blank"
        rel="noopener noreferrer">Svelte Hackathon</a
      > project, so it might not stay up for long.)
    </p>
  </div>

  <div class="bg-container">
    <div class="index-container">
      <section style="flex-grow: 0;">
        <Paper variant="unelevated">
          <Title style="min-width: max-content;">
            {#if loginMode === 'login'}
              Log in
            {:else}
              Sign up
            {/if}
          </Title>
          <Content>
            <Login {User} clientConfig={$clientConfig} bind:mode={loginMode} />
          </Content>
        </Paper>
      </section>

      <section class="big-points-container" style="min-width: 320px;">
        <h2>Fediverse</h2>
        <p>
          Neso is part of a huge network of servers that run ActivityPub called
          the Fediverse. ActivityPub is a protocol that lets users on different
          servers share content and activities with each other. Think of it like
          email, but for social networks.
        </p>

        <h2>Svelte</h2>
        <p>
          Neso is written with two technologies called Svelte and SvelteKit.
          Svelte provides Neso with an incredibly fast user experience and
          SvelteKit provides Neso with a well optimized server environment.
        </p>

        <h2>Hackathon</h2>
        <p>
          To showcase exactly how incredible Svelte and SvelteKit are, Neso was
          written by two developers in just one month for the Svelte Hackathon!
        </p>
      </section>
    </div>
  </div>
{/if}

<script lang="ts">
  import { Login } from '@nymphjs/tilmeld-components';
  import Paper, { Title, Content } from '@smui/paper';
  import CircularProgress from '@smui/circular-progress';
  import type { SessionStuff } from '$lib/nymph';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;
  let { User, stores } = data as SessionStuff;
  $: ({ User, stores } = data as SessionStuff);
  let { loading, user, clientConfig } = stores;
  $: ({ loading, user, clientConfig } = stores);

  let loginMode: 'login' | 'register' = 'login';

  $: if ($user != null) {
    goto(`/social/feed`);
  }
</script>
