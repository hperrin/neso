import type {
  SocialActivity,
  SocialActivityData,
} from '$lib/entities/SocialActivity.js';
import type { SocialObject as SocialObjectClass } from '$lib/entities/SocialObject.js';
import { getActorId } from '$lib/utils/getActorId.js';
import { getObjectId } from '$lib/utils/getObjectId.js';
import { getTargetId } from '$lib/utils/getTargetId.js';

export async function getActivityReferences(
  activity: SocialActivity & SocialActivityData,
  SocialObject: typeof SocialObjectClass
) {
  let actorId = getActorId(activity);
  let objectId = getObjectId(activity);
  let targetId = getTargetId(activity);

  let actor = actorId == null ? null : await SocialObject.getIdActor(actorId);
  let object =
    objectId == null ? null : await SocialObject.getIdActorOrObject(objectId);
  let target =
    targetId == null ? null : await SocialObject.getIdActorOrObject(targetId);

  return { actor, object, target };
}
