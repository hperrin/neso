import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { Project, nymph, stores } = await parent();
  const { projects } = stores;

  try {
    if (params.guid === '+' || params.guid === ' ' || params.guid === '%20') {
      return { project: Project.factorySync() };
    }

    let project = get(projects).find((project) => project.guid === params.guid);

    if (!project) {
      // If project wasn't found, it probably means it is done, so look it up.
      project =
        (await nymph.getEntity(
          { class: Project },
          { type: '&', guid: params.guid }
        )) ?? undefined;

      if (!project) {
        // If we still haven't found it, it just doesn't exist.
        throw error(404, 'Project not found.');
      }
    }

    return { project };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
