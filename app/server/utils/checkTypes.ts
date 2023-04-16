import type {
  APActivity,
  APActor,
  APCollection,
  APCollectionPage,
  APObject,
} from '_activitypub';

import type {
  SocialActivity,
  SocialActivityData,
} from '../entities/SocialActivity';
import type { SocialActor, SocialActorData } from '../entities/SocialActor';
import type { SocialObject, SocialObjectData } from '../entities/SocialObject';

export function isActivity(object: any): object is APActivity {
  return (
    (typeof object === 'object' &&
      typeof object.type === 'string' &&
      (object.type === 'Accept' ||
        object.type === 'TentativeAccept' ||
        object.type === 'Add' ||
        object.type === 'Arrive' ||
        object.type === 'Create' ||
        object.type === 'Delete' ||
        object.type === 'Follow' ||
        object.type === 'Ignore' ||
        object.type === 'Join' ||
        object.type === 'Leave' ||
        object.type === 'Like' ||
        object.type === 'Offer' ||
        object.type === 'Invite' ||
        object.type === 'Reject' ||
        object.type === 'TentativeReject' ||
        object.type === 'Remove' ||
        object.type === 'Undo' ||
        object.type === 'Update' ||
        object.type === 'View' ||
        object.type === 'Listen' ||
        object.type === 'Read' ||
        object.type === 'Move' ||
        object.type === 'Travel' ||
        object.type === 'Announce' ||
        object.type === 'Block' ||
        object.type === 'Flag' ||
        object.type === 'Dislike' ||
        object.type === 'Question')) ||
    (Array.isArray(object.type) &&
      (object.type.indexOf('Accept') !== -1 ||
        object.type.indexOf('TentativeAccept') !== -1 ||
        object.type.indexOf('Add') !== -1 ||
        object.type.indexOf('Arrive') !== -1 ||
        object.type.indexOf('Create') !== -1 ||
        object.type.indexOf('Delete') !== -1 ||
        object.type.indexOf('Follow') !== -1 ||
        object.type.indexOf('Ignore') !== -1 ||
        object.type.indexOf('Join') !== -1 ||
        object.type.indexOf('Leave') !== -1 ||
        object.type.indexOf('Like') !== -1 ||
        object.type.indexOf('Offer') !== -1 ||
        object.type.indexOf('Invite') !== -1 ||
        object.type.indexOf('Reject') !== -1 ||
        object.type.indexOf('TentativeReject') !== -1 ||
        object.type.indexOf('Remove') !== -1 ||
        object.type.indexOf('Undo') !== -1 ||
        object.type.indexOf('Update') !== -1 ||
        object.type.indexOf('View') !== -1 ||
        object.type.indexOf('Listen') !== -1 ||
        object.type.indexOf('Read') !== -1 ||
        object.type.indexOf('Move') !== -1 ||
        object.type.indexOf('Travel') !== -1 ||
        object.type.indexOf('Announce') !== -1 ||
        object.type.indexOf('Block') !== -1 ||
        object.type.indexOf('Flag') !== -1 ||
        object.type.indexOf('Dislike') !== -1 ||
        object.type.indexOf('Question') !== -1))
  );
}

export function isSocialActivity(
  object:
    | (SocialActivity & SocialActivityData)
    | (SocialActor & SocialActorData)
    | (SocialObject & SocialObjectData)
): object is SocialActivity & SocialActivityData {
  return isActivity(object);
}

export function isActor(object: any): object is APActor {
  return (
    (typeof object === 'object' &&
      typeof object.type === 'string' &&
      (object.type === 'Application' ||
        object.type === 'Group' ||
        object.type === 'Organization' ||
        object.type === 'Person' ||
        object.type === 'Service')) ||
    (Array.isArray(object.type) &&
      (object.type.indexOf('Application') !== -1 ||
        object.type.indexOf('Group') !== -1 ||
        object.type.indexOf('Organization') !== -1 ||
        object.type.indexOf('Person') !== -1 ||
        object.type.indexOf('Service') !== -1))
  );
}

export function isSocialActor(
  object:
    | (SocialActivity & SocialActivityData)
    | (SocialActor & SocialActorData)
    | (SocialObject & SocialObjectData)
): object is SocialActor & SocialActorData {
  return isActor(object);
}

export function isCollection(object: any): object is APCollection {
  return (
    (typeof object === 'object' &&
      typeof object.type === 'string' &&
      (object.type === 'Collection' || object.type === 'OrderedCollection')) ||
    (Array.isArray(object.type) &&
      (object.type.indexOf('Collection') !== -1 ||
        object.type.indexOf('OrderedCollection') !== -1))
  );
}

export function isSocialCollection(
  object:
    | (SocialActivity & SocialActivityData)
    | (SocialActor & SocialActorData)
    | (SocialObject & SocialObjectData)
): object is SocialObject &
  SocialObjectData & { type: 'Collection' | 'OrderedCollection' } {
  return isCollection(object);
}

export function isCollectionPage(object: any): object is APCollectionPage {
  return (
    (typeof object === 'object' &&
      typeof object.type === 'string' &&
      (object.type === 'CollectionPage' ||
        object.type === 'OrderedCollectionPage')) ||
    (Array.isArray(object.type) &&
      (object.type.indexOf('CollectionPage') !== -1 ||
        object.type.indexOf('OrderedCollectionPage') !== -1))
  );
}

export function isSocialCollectionPage(
  object:
    | (SocialActivity & SocialActivityData)
    | (SocialActor & SocialActorData)
    | (SocialObject & SocialObjectData)
): object is SocialObject &
  SocialObjectData & { type: 'CollectionPage' | 'OrderedCollectionPage' } {
  return isCollectionPage(object);
}

export function isObject(object: any): object is APObject {
  return (
    isCollection(object) ||
    isCollectionPage(object) ||
    (typeof object === 'object' &&
      typeof object.type === 'string' &&
      (object.type === 'Object' ||
        object.type === 'Relationship' ||
        object.type === 'Article' ||
        object.type === 'Article' ||
        object.type === 'Document' ||
        object.type === 'Audio' ||
        object.type === 'Image' ||
        object.type === 'Video' ||
        object.type === 'Note' ||
        object.type === 'Page' ||
        object.type === 'Event' ||
        object.type === 'Place' ||
        object.type === 'Mention' ||
        object.type === 'Profile' ||
        object.type === 'Tombstone')) ||
    (Array.isArray(object.type) &&
      (object.type.indexOf('Object') !== -1 ||
        object.type.indexOf('Relationship') !== -1 ||
        object.type.indexOf('Article') !== -1 ||
        object.type.indexOf('Article') !== -1 ||
        object.type.indexOf('Document') !== -1 ||
        object.type.indexOf('Audio') !== -1 ||
        object.type.indexOf('Image') !== -1 ||
        object.type.indexOf('Video') !== -1 ||
        object.type.indexOf('Note') !== -1 ||
        object.type.indexOf('Page') !== -1 ||
        object.type.indexOf('Event') !== -1 ||
        object.type.indexOf('Place') !== -1 ||
        object.type.indexOf('Mention') !== -1 ||
        object.type.indexOf('Profile') !== -1 ||
        object.type.indexOf('Tombstone') !== -1))
  );
}

export function isSocialObject(
  object:
    | (SocialActivity & SocialActivityData)
    | (SocialActor & SocialActorData)
    | (SocialObject & SocialObjectData)
): object is SocialObject & SocialObjectData {
  return isObject(object);
}
