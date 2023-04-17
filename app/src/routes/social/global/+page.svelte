<Feed
  feed="global"
  {activities}
  emptyMessage="Your instance's view of the world is empty!"
  stuff={data}
/>

<script lang="ts">
  import Feed from '$lib/components/social/Feed.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { activities } = data;
  $: ({ activities } = data);
</script>
