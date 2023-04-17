<Feed
  feed="favorites"
  {activities}
  emptyMessage="You've got no favorites yet. Time to explore!"
  stuff={data}
/>

<script lang="ts">
  import Feed from '$lib/components/social/Feed.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let { activities } = data;
  $: ({ activities } = data);
</script>
