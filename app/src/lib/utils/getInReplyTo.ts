import type {
  SocialObject,
  SocialObjectData,
} from '$lib/entities/SocialObject.js';
import { isLink, isObject } from '$lib/utils/checkTypes.js';

export function getInReplyTo(object: SocialObject & SocialObjectData) {
  if (!object.inReplyTo) {
    return null;
  }

  if (Array.isArray(object.inReplyTo)) {
    if (isLink(object.inReplyTo[0])) {
      return typeof object.inReplyTo[0] === 'string'
        ? object.inReplyTo[0]
        : object.inReplyTo[0].href;
    }

    return isObject(object.inReplyTo[0])
      ? object.inReplyTo[0].id
      : object.inReplyTo[0];
  }

  if (isLink(object.inReplyTo)) {
    return typeof object.inReplyTo === 'string'
      ? object.inReplyTo
      : object.inReplyTo.href;
  }

  return isObject(object.inReplyTo) ? object.inReplyTo.id : object.inReplyTo;
}
