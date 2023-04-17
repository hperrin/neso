import type {
  SocialActivity,
  SocialActivityData,
} from '$lib/entities/SocialActivity.js';
import { isLink, isObject } from '$lib/utils/checkTypes.js';

export function getTargetId(activity: SocialActivity & SocialActivityData) {
  if (!activity.target) {
    return null;
  }

  if (Array.isArray(activity.target)) {
    if (isLink(activity.target[0])) {
      return typeof activity.target[0] === 'string'
        ? activity.target[0]
        : activity.target[0].href;
    }

    return isObject(activity.target[0])
      ? activity.target[0].id
      : activity.target[0];
  }

  if (isLink(activity.target)) {
    return typeof activity.target === 'string'
      ? activity.target
      : activity.target.href;
  }

  return isObject(activity.target) ? activity.target.id : activity.target;
}
