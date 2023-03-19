import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { nymph, Todo } = await parent();

  try {
    const todo = await nymph.getEntity(
      { class: Todo },
      { type: '&', guid: params.guid }
    );

    if (todo) {
      await todo.$readyAll(1);
    } else {
      throw error(404, 'Todo not found.');
    }

    return { todo };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
