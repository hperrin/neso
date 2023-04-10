import type { Nymph } from '@nymphjs/nymph';
import { guid } from '@nymphjs/guid';
import { User as UserClass } from '@nymphjs/tilmeld';
import type {
  IApexStore,
  Context,
  APEXObject,
  APEXActivity,
  APEXActor,
  APEXIntransitiveActivity,
  Delivery,
} from 'activitypub-express';
import ActivitypubExpress from 'activitypub-express';

import { SocialActivity as SocialActivityClass } from './entities/SocialActivity.js';
import type { SocialActivityData } from './entities/SocialActivity.js';
import { SocialActor as SocialActorClass } from './entities/SocialActor.js';
import type { SocialActorData } from './entities/SocialActor.js';
import { SocialCollection as SocialCollectionClass } from './entities/SocialCollection.js';
import type { SocialCollectionData } from './entities/SocialCollection.js';
import { SocialCollectionEntry as SocialCollectionEntryClass } from './entities/SocialCollectionEntry.js';
import type { SocialCollectionEntryData } from './entities/SocialCollectionEntry.js';
import { SocialObject as SocialObjectClass } from './entities/SocialObject.js';
import type { SocialObjectData } from './entities/SocialObject.js';

import {
  AP_ROUTES,
  AP_USER_ID_PREFIX,
  AP_USER_INBOX_PREFIX,
  AP_USER_OUTBOX_PREFIX,
  AP_USER_FOLLOWERS_PREFIX,
  AP_USER_FOLLOWING_PREFIX,
  AP_USER_LIKED_PREFIX,
} from './utils/constants.js';
import { isActivity, isActor, isObject } from './utils/checkTypes.js';

export function buildApex(nymph: Nymph) {
  const store = new ApexStore(nymph);

  return ActivitypubExpress({
    name: 'Neso',
    version: process.env.npm_package_version,
    openRegistrations: false,
    nodeInfoMetadata: {},
    baseUrl: 'http://127.0.0.1:5173',
    domain: '127.0.0.1',
    actorParam: 'actor',
    objectParam: 'id',
    activityParam: 'id',
    routes: AP_ROUTES,
    store,
    endpoints: {
      uploadMedia: 'https://localhost/upload',
      oauthAuthorizationEndpoint: 'https://localhost/auth/authorize',
      proxyUrl: 'https://localhost/proxy',
    },
  });
}

class ApexStore implements IApexStore {
  nymph: Nymph;
  User: typeof UserClass;
  SocialActivity: typeof SocialActivityClass;
  SocialActor: typeof SocialActorClass;
  SocialCollection: typeof SocialCollectionClass;
  SocialCollectionEntry: typeof SocialCollectionEntryClass;
  SocialObject: typeof SocialObjectClass;

  constructor(nymph: Nymph) {
    this.nymph = nymph;
    this.User = nymph.getEntityClass(UserClass.class) as typeof UserClass;
    this.SocialActivity = nymph.getEntityClass(
      SocialActivityClass.class
    ) as typeof SocialActivityClass;
    this.SocialActor = nymph.getEntityClass(
      SocialActorClass.class
    ) as typeof SocialActorClass;
    this.SocialCollection = nymph.getEntityClass(
      SocialCollectionClass.class
    ) as typeof SocialCollectionClass;
    this.SocialCollectionEntry = nymph.getEntityClass(
      SocialCollectionEntryClass.class
    ) as typeof SocialCollectionEntryClass;
    this.SocialObject = nymph.getEntityClass(
      SocialObjectClass.class
    ) as typeof SocialObjectClass;
  }

  async setup(_optionalActor: APEXActor) {
    // TODO
    console.log('setup');
  }

  async getObject(id: string, includeMeta: boolean) {
    // console.log('getObject', { id, includeMeta });
    if (id.startsWith(AP_USER_ID_PREFIX)) {
      const username = id.substring(AP_USER_ID_PREFIX.length);
      const user = await this.User.factoryUsername(username);

      if (!user) {
        throw new Error('Not found.');
      }

      return {
        type: 'Person',
        id: `${AP_USER_ID_PREFIX}${user.username}`,
        name: user.name,
        preferredUsername: user.username,
        inbox: `${AP_USER_INBOX_PREFIX}${user.username}`,
        outbox: `${AP_USER_OUTBOX_PREFIX}${user.username}`,
        followers: `${AP_USER_FOLLOWERS_PREFIX}${user.username}`,
        following: `${AP_USER_FOLLOWING_PREFIX}${user.username}`,
        liked: `${AP_USER_LIKED_PREFIX}${user.username}`,
      } as APEXActor;
    }

    // Look for an actor.
    const actor = await this.SocialActor.factoryId(id);
    if (actor != null) {
      return (await actor.$toAPObject(includeMeta)) as APEXActor;
    }

    // Look for an object.
    const object = await this.SocialObject.factoryId(id);
    if (object != null) {
      return (await object.$toAPObject(includeMeta)) as APEXObject;
    }

    throw new Error('Not found.');
  }

  async saveObject(object: APEXObject) {
    // console.log('saveObject', object);

    if (isActivity(object)) {
      const obj = await this.SocialActivity.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$save();
    }

    if (isActor(object)) {
      const obj = await this.SocialActor.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$save();
    }

    if (isObject(object)) {
      const obj = await this.SocialObject.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$save();
    }

    throw new Error('Unsupported object type.');
  }

  async getActivity(id: string, includeMeta: boolean) {
    // console.log('getActivity', { id, includeMeta });

    // Look for an activity.
    const activity = await this.SocialActivity.factoryId(id);
    if (activity != null) {
      return (await activity.$toAPObject(includeMeta)) as APEXActivity;
    }

    throw new Error('Not found.');
  }

  async findActivityByCollectionAndObjectId(
    collection: string,
    objectId: string,
    includeMeta: boolean
  ) {
    // TODO
    console.log('findActivityByCollectionAndObjectId', {
      collection,
      objectId,
      includeMeta,
    });
    return {
      id: 'id',
      type: 'Activity',
      actor: ['someone'],
      object: { type: 'Object' },
    } as APEXActivity;
  }

  async findActivityByCollectionAndActorId(
    collection: string,
    actorId: string,
    includeMeta: boolean
  ) {
    // TODO
    console.log('findActivityByCollectionAndActorId', {
      collection,
      actorId,
      includeMeta,
    });
    return {
      id: 'id',
      type: 'Activity',
      actor: ['someone'],
      object: { type: 'Object' },
    } as APEXActivity;
  }

  /**
   * Return a specific collection (stream of activitites), e.g. a user's inbox
   * @param collectionId collection identifier
   * @param limit max number of activities to return
   * @param after id to begin querying after (i.e. last item of last page)
   * @param blockList list of ids of actors whose activities should be excluded
   * @param query additional query/aggregation
   */
  async getStream(
    collectionId: string,
    limit?: number | null,
    after?: string | null,
    blockList?: string[],
    query?: any
  ) {
    // TODO
    console.log('getStream', {
      collectionId,
      limit,
      after,
      blockList,
      query,
    });
    return [
      // {
      //   id: 'id',
      //   type: 'Activity',
      //   actor: ['someone'],
      //   object: { type: 'Object' },
      // } as APEXActivity,
    ];
  }

  async getStreamCount(collectionId: string) {
    // TODO
    console.log('getStreamCount', { collectionId });
    return 1;
  }

  async getContext(documentUrl: string) {
    // TODO
    console.log('getContext', { documentUrl });
    return { contextUrl: '', documentUrl: '', document: {} };
  }

  async getUsercount() {
    // TODO
    console.log('getUsercount');
    return 1;
  }

  async saveContext(context: Context) {
    // TODO
    console.log('saveContext', context);
    return;
  }

  /**
   * Return true if it was saved and is new. Return false if saving failed.
   * Return undefined if it has already been saved (the ID exists).
   */
  async saveActivity(activity: APEXActivity | APEXIntransitiveActivity) {
    // TODO
    console.log('saveActivity', activity);
    return true;
  }

  async removeActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    actorId: string
  ) {
    // TODO
    console.log('removeActivity', activity, { actorId });
    return [];
  }

  /**
   * Return the activity after updating it.
   */
  async updateActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    fullReplace: boolean
  ) {
    // TODO
    console.log('updateActivity', activity, { fullReplace });
    return activity;
  }

  /**
   * Return the activity after updating the meta.
   */
  async updateActivityMeta(
    activity: APEXActivity | APEXIntransitiveActivity,
    key: string,
    value: any,
    remove: boolean
  ) {
    // TODO
    console.log('updateActivityMeta', activity, { key, value, remove });
    return activity;
  }

  generateId() {
    // console.log('generateId');
    return guid();
  }

  async updateObject(obj: APEXObject, actorId: string, fullReplace: boolean) {
    // TODO
    console.log('updateObject', obj, {
      actorId,
      fullReplace,
    });
    return obj;
  }

  /**
   * Find the first deliver where `after` is less than `new Date()`, delete
   * it, and return it.
   *
   * If none exist, find the next delivery, and return a `waitUntil` for its
   * `after`.
   *
   * If no deliveries exist, return null.
   */
  async deliveryDequeue() {
    // TODO
    console.log('deliveryDequeue');
    return null;
  }

  async deliveryEnqueue(
    actorId: string,
    body: string,
    addresses: string | string[],
    signingKey: string
  ) {
    // TODO
    console.log('deliveryEnqueue', {
      actorId,
      body,
      addresses,
      signingKey,
    });
    return true;
  }

  /**
   * Insert the delivery back into the DB after updating its `after` prop.
   */
  async deliveryRequeue(delivery: Delivery) {
    // TODO
    console.log('deliveryRequeue', delivery);
  }
}
