import type {
  SocialActivity,
  SocialActivityData,
} from '$lib/entities/SocialActivity.js';
import { isLink, isObject } from '$lib/utils/checkTypes.js';

export function getObjectId(activity: SocialActivity & SocialActivityData) {
  if (!activity.object) {
    return null;
  }

  if (Array.isArray(activity.object)) {
    if (isLink(activity.object[0])) {
      return typeof activity.object[0] === 'string'
        ? activity.object[0]
        : activity.object[0].href;
    }

    return isObject(activity.object[0])
      ? activity.object[0].id
      : activity.object[0];
  }

  if (isLink(activity.object)) {
    return typeof activity.object === 'string'
      ? activity.object
      : activity.object.href;
  }

  return isObject(activity.object) ? activity.object.id : activity.object;
}
