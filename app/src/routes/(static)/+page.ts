import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { SessionStuff } from '$lib/nymph.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();
  const { stores } = data as SessionStuff;
  const { readyPromise, user } = stores;
  await get(readyPromise);

  if (get(user) != null) {
    throw redirect(302, `/social/feed`);
  }

  return {};
};
