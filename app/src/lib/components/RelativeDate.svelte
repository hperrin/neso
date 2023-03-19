{text}

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import DateFormatter from '$lib/utils/DateFormatter';

  export let date: number | null | undefined;
  /**
   * Either all are auto, or none. Setting only one won't work.
   */
  export let dateStyle: 'wymd' | 'wmd' | 'w' | '' | 'ago' | 'auto' = 'auto';
  /**
   * Either all are auto, or none. Setting only one won't work.
   */
  export let timeStyle: 'hms' | 'hm' | 'h' | '' | 'auto' = 'auto';
  /**
   * Either all are auto, or none. Setting only one won't work.
   */
  export let length: 'short' | 'long' | 'auto' = 'auto';

  let text: string;
  let interval: number | NodeJS.Timer;

  updateTime();

  onMount(() => {
    interval = setInterval(updateTime, 10000);
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  function updateTime() {
    if (date == null) {
      text = 'Pending';
      return;
    }
    const now = new Date().getTime();
    const dateFormatter = new DateFormatter(Math.min(date, +new Date()));

    if (dateStyle === 'auto' || timeStyle === 'auto' || length === 'auto') {
      if (now - date > 10 * 30 * 24 * 60 * 60 * 1000) {
        // More than 10 months ago.
        text = dateFormatter.format('wymd', '', 'short');
      } else if (now - date > 6 * 24 * 60 * 60 * 1000) {
        // More than 6 days ago.
        text = dateFormatter.format('wmd', '', 'short');
      } else if (now - date > 24 * 60 * 60 * 1000) {
        // More than 1 day ago.
        text = dateFormatter.format('w', 'h', 'short');
      } else {
        text = dateFormatter.format('ago', '', 'long');
      }
    } else {
      text = dateFormatter.format(dateStyle, timeStyle, length);
    }
  }
</script>
