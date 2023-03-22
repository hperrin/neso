import type { Nymph } from '@nymphjs/nymph';
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

export const routes = {
  actor: '/u/:actor',
  object: '/o/:id',
  activity: '/s/:id',
  inbox: '/inbox/:actor',
  outbox: '/outbox/:actor',
  followers: '/followers/:actor',
  following: '/following/:actor',
  liked: '/liked/:actor',
  shares: '/s/:id/shares',
  likes: '/s/:id/likes',
  collections: '/u/:actor/c/:id',
  blocked: '/u/:actor/blocked',
  rejections: '/u/:actor/rejections',
  rejected: '/u/:actor/rejected',
  nodeinfo: '/nodeinfo',
};

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
    routes,
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

  constructor(nymph: Nymph) {
    this.nymph = nymph;
  }

  async setup(_optionalActor: APEXActor) {
    console.log('setup');
  }

  async getObject(id: string, includeMeta: boolean) {
    console.log('getObject', { id, includeMeta });
    if (id === 'http://127.0.0.1:5173/u/hperrin') {
      return {
        type: 'Person',
        id: 'http://127.0.0.1:5173/u/hperrin',
        name: 'Hunter Perrin',
      } as APEXActor;
    }
    return { id, type: 'Object' };
  }

  async saveObject(object: APEXObject) {
    console.log('saveObject', object);
    return true;
  }

  async getActivity(id: string, includeMeta: boolean) {
    console.log('getActivity', { id, includeMeta });
    return { id, type: 'Activity', actor: ['someone'], object: {} };
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
    return { id: 'id', type: 'Activity', actor: ['someone'], object: {} };
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
    return { id: 'id', type: 'Activity', actor: ['someone'], object: {} };
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
    return [{ id: 'id', type: 'Activity', actor: ['someone'], object: {} }];
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
    return '1';
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
