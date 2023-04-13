import { error, redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
  const { stores, nymph, AuthClient } = await parent();
  const { user } = stores;

  if (get(user) == null) {
    throw redirect(303, '/');
  }

  if (!url.searchParams.has('client_id')) {
    throw error(400, 'Missing client id.');
  }

  const client_id = url.searchParams.get('client_id');

  try {
    const client = await nymph.getEntity(
      { class: AuthClient },
      { type: '&', equal: ['id', client_id] }
    );

    if (client == null) {
      throw error(404, 'Client not found.');
    }

    return {
      client,
    };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
