<Paper>
  <Subtitle>
    <span title={new Date(activity.cdate || 0).toLocaleString()}
      ><RelativeDate date={activity.cdate} /></span
    >
  </Subtitle>
  <Content>
    <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
        activity,
        null,
        2
      )}</pre>
  </Content>
</Paper>

<script lang="ts">
  import Paper, { Subtitle, Content } from '@smui/paper';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import type {
    SocialActivity,
    SocialActivityData,
  } from '$lib/entities/SocialActivity';

  export let activity: SocialActivity & SocialActivityData;
</script>
