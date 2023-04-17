import type {
  SocialObject,
  SocialObjectData,
} from '$lib/entities/SocialObject.js';
import { isLink, isObject } from '$lib/utils/checkTypes.js';

export function getAuthorId(object: SocialObject & SocialObjectData) {
  if (Array.isArray(object.attributedTo)) {
    if (isLink(object.attributedTo[0])) {
      return typeof object.attributedTo[0] === 'string'
        ? object.attributedTo[0]
        : object.attributedTo[0].href;
    }

    return isObject(object.attributedTo[0])
      ? object.attributedTo[0].id
      : object.attributedTo[0];
  }

  if (isLink(object.attributedTo)) {
    return typeof object.attributedTo === 'string'
      ? object.attributedTo
      : object.attributedTo.href;
  }

  return isObject(object.attributedTo)
    ? object.attributedTo.id
    : object.attributedTo;
}
