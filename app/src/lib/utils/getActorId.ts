import type {
  SocialActivity,
  SocialActivityData,
} from '$lib/entities/SocialActivity.js';
import { isLink, isObject } from '$lib/utils/checkTypes.js';

export function getActorId(activity: SocialActivity & SocialActivityData) {
  if (!activity.actor) {
    return null;
  }

  if (Array.isArray(activity.actor)) {
    if (isLink(activity.actor[0])) {
      return typeof activity.actor[0] === 'string'
        ? activity.actor[0]
        : activity.actor[0].href;
    }

    return isObject(activity.actor[0])
      ? activity.actor[0].id
      : activity.actor[0];
  }

  if (isLink(activity.actor)) {
    return typeof activity.actor === 'string'
      ? activity.actor
      : activity.actor.href;
  }

  return isObject(activity.actor) ? activity.actor.id : activity.actor;
}
