<div class="page-content">
  <h1>Feed</h1>

  <Paper>
    <div class="post">
      <div class="post-header">
        <div class="profile">
          <img
            class="avatar"
            src="/7e17137d13723410.png"
            alt="User's avatar"
            width="128"
            height="128"
          />
          <div class="name">
            <div>
              <strong>Hunter Perrin</strong>
            </div>
            <span>@hperrin@port87.social</span>
          </div>
        </div>
        <span>{format(new Date(Date.now() - 60000))}</span>
      </div>
      <div class="note">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis,
          repellat quae aliquid similique quo fugit, aliquam iusto quos,
          accusantium sit numquam quam quod aut ut? Repellendus aliquam ad nisi
          ut dolor natus eius, porro eum officia impedit eveniet nesciunt
          excepturi ullam vitae cumque, libero illo in facilis quam. Saepe
          necessitatibus obcaecati officia. Animi vero iste reiciendis
          blanditiis quasi voluptatum ipsam doloribus quia? Dicta explicabo
          necessitatibus quisquam veritatis, quos sapiente incidunt, natus
          laborum, nesciunt doloribus temporibus debitis enim placeat nobis
          voluptatum provident minima! Sit eum natus illo corrupti placeat
          exercitationem id odio voluptate repellat minus quo, ea alias error
          impedit eveniet!
        </p>
      </div>
      <div class="actions">
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiReply} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiSync} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiStar} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiBookmark} />
          </Icon>
        </IconButton>
        <IconButton>
          <Icon component={Svg} viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiDotsHorizontal} />
          </Icon>
        </IconButton>
      </div>
    </div>
  </Paper>
</div>

<script lang="ts">
  import {
    mdiBookmark,
    mdiDotsHorizontal,
    mdiReply,
    mdiStar,
    mdiSync,
  } from '@mdi/js';
  import { Icon, Svg } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import Paper from '@smui/paper';

  // relative format using intl relative time format
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    style: 'narrow',
  });

  function format(date: Date) {
    const diff = (date.getTime() - Date.now()) / 1000,
      abs = Math.abs(diff);
    console.log(diff, abs);
    if (abs < 60) {
      return formatter.format(Math.round(diff), 'second');
    } else if (abs < 3600) {
      return formatter.format(Math.round(diff / 60), 'minute');
    } else if (abs < 86400) {
      return formatter.format(Math.round(diff / 3600), 'hour');
    } else if (abs < 604800) {
      return formatter.format(Math.round(diff / 86400), 'day');
    } else if (abs < 2592000) {
      return formatter.format(Math.round(diff / 604800), 'week');
    } else if (abs < 31536000) {
      return formatter.format(Math.round(diff / 2592000), 'month');
    } else {
      return formatter.format(Math.round(diff / 31536000), 'year');
    }
  }
</script>

<style>
  .actions,
  .post-header {
    display: flex;
    justify-content: space-between;
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 5px;
  }

  .post {
    margin: 5px auto;
  }

  .actions {
    margin-top: 5px;
  }
</style>
