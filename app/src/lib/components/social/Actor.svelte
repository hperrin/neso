<Paper>
  <Subtitle>
    <span title={new Date(actor.cdate || 0).toLocaleString()}
      ><RelativeDate date={actor.cdate} /></span
    >
  </Subtitle>
  <Content>
    <pre style="max-width: 100%; overflow-x: auto;">{JSON.stringify(
        actor,
        null,
        2
      )}</pre>
  </Content>
</Paper>

<script lang="ts">
  import Paper, { Subtitle, Content } from '@smui/paper';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import type { SocialActor, SocialActorData } from '$lib/entities/SocialActor';

  export let actor: SocialActor & SocialActorData;
</script>
