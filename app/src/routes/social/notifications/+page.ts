import { error } from '@sveltejs/kit';
import { getActivityReferences } from '$lib/utils/getActivityReferences.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { SocialActivity, SocialObject } = await parent();

  try {
    let activities = await SocialActivity.getFeed('notifications');

    return {
      activities: await Promise.all(
        activities.map(async (entity) => {
          const { actor, object, target } = await getActivityReferences(
            entity,
            SocialObject
          );

          return { entity, actor, object, target };
        })
      ),
    };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
