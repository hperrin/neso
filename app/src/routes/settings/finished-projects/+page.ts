import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { nymph, Project } = await parent();

  try {
    return {
      projects: await nymph.getEntities(
        { class: Project },
        { type: '&', truthy: 'done' }
      ),
    };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
