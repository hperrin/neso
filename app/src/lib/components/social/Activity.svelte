<Paper>
  <Subtitle>
    <span title={new Date(actvitiy.cdate || 0).toLocaleString()}
      ><RelativeDate date={actvitiy.cdate} /></span
    >
  </Subtitle>
  <Content>
    <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
        actvitiy,
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

  export let actvitiy: SocialActivity & SocialActivityData;
</script>
