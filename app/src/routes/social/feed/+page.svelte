<Feed
  feed="home"
  {activities}
  emptyMessage="Your feed is empty!"
  bind:stuff={data}
/>

<script lang="ts">
  import Feed from '$lib/components/social/Feed.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { activities } = data;
  $: ({ activities } = data);
</script>
