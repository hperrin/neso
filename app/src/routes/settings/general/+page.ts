import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { stores } = await parent();
  const { settingsReadyPromise } = stores;

  await get(settingsReadyPromise);

  return {};
};
