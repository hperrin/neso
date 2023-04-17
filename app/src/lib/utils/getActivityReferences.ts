import type {
  SocialActivity,
  SocialActivityData,
} from '$lib/entities/SocialActivity.js';
import type {
  SocialActor as SocialActorClass,
  SocialActorData,
} from '$lib/entities/SocialActor.js';
import type {
  SocialObject as SocialObjectClass,
  SocialObjectData,
} from '$lib/entities/SocialObject.js';
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

  let actor =
    actorId == null
      ? null
      : ((await SocialObject.getId(actorId)) as SocialActorClass &
          SocialActorData);
  let object =
    objectId == null
      ? null
      : ((await SocialObject.getId(objectId)) as
          | (SocialObjectClass & SocialObjectData)
          | (SocialActorClass & SocialActorData));
  let target =
    targetId == null
      ? null
      : ((await SocialObject.getId(targetId)) as
          | (SocialObjectClass & SocialObjectData)
          | (SocialActorClass & SocialActorData));

  return { actor, object, target };
}
