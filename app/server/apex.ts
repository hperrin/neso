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

import {
  AP_ROUTES,
  AP_USER_ID_PREFIX,
  AP_USER_INBOX_PREFIX,
  AP_USER_OUTBOX_PREFIX,
  AP_USER_FOLLOWERS_PREFIX,
  AP_USER_FOLLOWING_PREFIX,
  AP_USER_LIKED_PREFIX,
} from './utils/constants.js';

export function buildApex(nymph: Nymph) {
  const store = new ApexStore(nymph);

  return ActivitypubExpress({
    name: 'Oblag',
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

  constructor(nymph: Nymph) {
    this.nymph = nymph;
    this.User = nymph.getEntityClass(UserClass.class) as typeof UserClass;
  }

  async setup(_optionalActor: APEXActor) {
    console.log('setup');
  }

  async getObject(id: string, includeMeta: boolean) {
    console.log('getObject', { id, includeMeta });
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
    return { id, type: 'Object' } as APEXObject;
  }

  async saveObject(object: APEXObject) {
    console.log('saveObject', object);
    return true;
  }

  async getActivity(id: string, includeMeta: boolean) {
    console.log('getActivity', { id, includeMeta });
    return {
      id,
      type: 'Activity',
      actor: ['someone'],
      object: { type: 'Object' },
    } as APEXActivity;
  }

  async findActivityByCollectionAndObjectId(
    collection: string,
    objectId: string,
    includeMeta: boolean
  ) {
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
    console.log('getStreamCount', { collectionId });
    return 1;
  }

  async getContext(documentUrl: string) {
    console.log('getContext', { documentUrl });
    return { contextUrl: '', documentUrl: '', document: {} };
  }

  async getUsercount() {
    console.log('getUsercount');
    return 1;
  }

  async saveContext(context: Context) {
    console.log('saveContext', context);
    return;
  }

  /**
   * Return true if it was saved and is new. Return false if saving failed.
   * Return undefined if it has already been saved (the ID exists).
   */
  async saveActivity(activity: APEXActivity | APEXIntransitiveActivity) {
    console.log('saveActivity', activity);
    return true;
  }

  async removeActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    actorId: string
  ) {
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
    console.log('updateActivityMeta', activity, { key, value, remove });
    return activity;
  }

  generateId() {
    console.log('generateId');
    return guid();
  }

  async updateObject(obj: APEXObject, actorId: string, fullReplace: boolean) {
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
    console.log('deliveryDequeue');
    return null;
  }

  async deliveryEnqueue(
    actorId: string,
    body: string,
    addresses: string | string[],
    signingKey: string
  ) {
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
    console.log('deliveryRequeue', delivery);
  }
}
