import { generateKeyPair } from 'node:crypto';
import type { Nymph, Options, Selector } from '@nymphjs/nymph';
import { guid } from '@nymphjs/guid';
import { HttpError } from '@nymphjs/server';
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

import { SocialContext as SocialContextClass } from './entities/SocialContext.js';
import type { SocialContextData } from './entities/SocialContext.js';
import { SocialDelivery as SocialDeliveryClass } from './entities/SocialDelivery.js';
import type { SocialDeliveryData } from './entities/SocialDelivery.js';
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

import { DOMAIN, ADDRESS } from './nymph.js';
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
    version: '1.0.0',
    openRegistrations: false,
    nodeInfoMetadata: {},
    baseUrl: ADDRESS,
    domain: DOMAIN,
    actorParam: 'actor',
    objectParam: 'id',
    activityParam: 'id',
    routes: AP_ROUTES,
    store,
    endpoints: {
      uploadMedia: `${ADDRESS}/upload`,
      oauthAuthorizationEndpoint: `${ADDRESS}/oauth/authorize`,
      proxyUrl: `${ADDRESS}/proxy`,
    },
  });
}

class ApexStore implements IApexStore {
  nymph: Nymph;
  User: typeof UserClass;
  SocialContext: typeof SocialContextClass;
  SocialDelivery: typeof SocialDeliveryClass;
  SocialActivity: typeof SocialActivityClass;
  SocialActor: typeof SocialActorClass;
  SocialCollection: typeof SocialCollectionClass;
  SocialCollectionEntry: typeof SocialCollectionEntryClass;
  SocialObject: typeof SocialObjectClass;

  constructor(nymph: Nymph) {
    this.nymph = nymph;
    this.User = nymph.getEntityClass(UserClass.class) as typeof UserClass;
    this.SocialContext = nymph.getEntityClass(
      SocialContextClass.class
    ) as typeof SocialContextClass;
    this.SocialDelivery = nymph.getEntityClass(
      SocialDeliveryClass.class
    ) as typeof SocialDeliveryClass;
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
    // console.log('setup');
  }

  async getObject(id: string, includeMeta: boolean) {
    // console.log('getObject', { id, includeMeta });

    // Look for an actor.
    const actor = await this.SocialActor.factoryId(id);
    if (actor.guid != null) {
      return (await actor.$toAPObject(includeMeta)) as APEXActor;
    } else if (id.startsWith(AP_USER_ID_PREFIX)) {
      // This is a user who doesn't have an actor object yet. Let's make them
      // one.
      const username = id.substring(AP_USER_ID_PREFIX.length);
      const user = await this.User.factoryUsername(username);

      if (!user) {
        throw new Error('Not found.');
      }

      actor.$acceptAPObject(
        {
          type: 'Person',
          id: `${AP_USER_ID_PREFIX}${user.username}`,
          name: user.name,
          preferredUsername: user.username,
          inbox: `${AP_USER_INBOX_PREFIX}${user.username}`,
          outbox: `${AP_USER_OUTBOX_PREFIX}${user.username}`,
          followers: `${AP_USER_FOLLOWERS_PREFIX}${user.username}`,
          following: `${AP_USER_FOLLOWING_PREFIX}${user.username}`,
          liked: `${AP_USER_LIKED_PREFIX}${user.username}`,
        } as APEXActor,
        true
      );

      // Create a key pair.
      const [publicKey, privateKey] = await new Promise<[string, string]>(
        (resolve, reject) =>
          generateKeyPair(
            'rsa',
            {
              modulusLength: 4096,
              publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
              },
              privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
              },
            },
            (error, publicKey, privateKey) => {
              if (error) {
                reject(error);
              }
              resolve([publicKey, privateKey]);
            }
          )
      );

      actor.user = user;
      actor.publicKey = {
        id: `${AP_USER_ID_PREFIX}${user.username}#main-key`,
        owner: `${AP_USER_ID_PREFIX}${user.username}`,
        publicKeyPem: publicKey,
      };
      actor._meta = {
        privateKey,
      };

      if (!(await actor.$saveSkipAC())) {
        throw new Error("Couldn't create actor for user.");
      }

      return (await actor.$toAPObject(includeMeta)) as APEXActor;
    }

    // Look for an object.
    const object = await this.SocialObject.factoryId(id);
    if (object.guid != null) {
      return (await object.$toAPObject(includeMeta)) as APEXObject;
    }

    throw new Error('Not found.');
  }

  async saveObject(object: APEXObject) {
    // console.log('saveObject', object);

    if (isActivity(object)) {
      const obj = await this.SocialActivity.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$saveSkipAC();
    }

    if (isActor(object)) {
      const obj = await this.SocialActor.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$saveSkipAC();
    }

    if (isObject(object)) {
      const obj = await this.SocialObject.factory();
      await obj.$acceptAPObject(object, true);

      return await obj.$saveSkipAC();
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
    // console.log('findActivityByCollectionAndObjectId', {
    //   collection,
    //   objectId,
    //   includeMeta,
    // });

    const entity = await this.nymph.getEntity(
      { class: this.SocialCollectionEntry },
      {
        type: '&',
        qref: [
          [
            'collection',
            [
              { class: this.SocialCollection },
              { type: '&', equal: ['id', collection] },
            ],
          ],
          [
            'entry',
            [
              { class: this.SocialActivity },
              {
                type: '|',
                equal: ['object', objectId],
                contain: ['object', objectId],
                qref: [
                  'object',
                  [
                    { class: this.SocialObject },
                    { type: '&', equal: ['id', objectId] },
                  ],
                ],
              },
            ],
          ],
        ],
      }
    );
    if (entity) {
      return (await entity.entry.$toAPObject(includeMeta)) as APEXActivity;
    }
    return null;
  }

  async findActivityByCollectionAndActorId(
    collection: string,
    actorId: string,
    includeMeta: boolean
  ) {
    // console.log('findActivityByCollectionAndActorId', {
    //   collection,
    //   actorId,
    //   includeMeta,
    // });

    const entity = await this.nymph.getEntity(
      { class: this.SocialCollectionEntry },
      {
        type: '&',
        qref: [
          [
            'collection',
            [
              { class: this.SocialCollection },
              { type: '&', equal: ['id', collection] },
            ],
          ],
          [
            'entry',
            [
              { class: this.SocialActivity },
              {
                type: '|',
                equal: ['actor', actorId],
                contain: ['actor', actorId],
                qref: [
                  'actor',
                  [
                    { class: this.SocialActor },
                    { type: '&', equal: ['id', actorId] },
                  ],
                ],
              },
            ],
          ],
        ],
      }
    );
    if (entity) {
      return (await entity.entry.$toAPObject(includeMeta)) as APEXActivity;
    }
    return null;
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
    // console.log('getStream', {
    //   collectionId,
    //   limit,
    //   after,
    //   blockList,
    //   query,
    // });

    let afterEntry:
      | (SocialCollectionEntryClass & SocialCollectionEntryData)
      | null = null;
    if (after) {
      let afterEntity: SocialActivityClass & SocialActivityData;
      afterEntity = await this.SocialActivity.factoryId(after);

      if (afterEntity.guid != null) {
        afterEntry = await this.nymph.getEntity(
          { class: this.SocialCollectionEntry },
          { type: '&', ref: ['entry', afterEntity] }
        );
      }
    }

    const entries = await this.nymph.getEntities(
      {
        class: this.SocialCollectionEntry,
        sort: 'cdate',
        reverse: true,
        ...(limit != null ? { limit } : {}),
      },
      {
        type: '&',
        qref: [
          [
            'collection',
            [
              { class: this.SocialCollection },
              { type: '&', equal: ['id', collectionId] },
            ],
          ],
        ],
        ...(afterEntry != null && afterEntry.guid != null
          ? {
              lte: ['cdate', afterEntry.cdate || 0],
              '!guid': afterEntry.guid,
            }
          : {}),
      },
      ...(blockList?.length
        ? [
            {
              type: '!&',
              qref: [
                [
                  'entry',
                  [
                    { class: this.SocialActivity },
                    {
                      type: '|',
                      equal: blockList.map(
                        (actor) => ['actor', actor] as [string, string]
                      ),
                      contain: blockList.map(
                        (actor) => ['actor', actor] as [string, string]
                      ),
                      qref: blockList.map(
                        (actor) =>
                          [
                            'actor',
                            [
                              { class: this.SocialActor },
                              {
                                type: '&',
                                equal: ['id', actor],
                              },
                            ],
                          ] as [string, [Options, ...Selector[]]]
                      ),
                    },
                  ],
                ],
              ],
            } as Selector,
          ]
        : [])
    );

    return (await Promise.all(
      entries.map((e) => e.entry.$toAPObject(false))
    )) as APEXActivity[];
  }

  async getStreamCount(collectionId: string) {
    // console.log('getStreamCount', { collectionId });
    return await this.nymph.getEntities(
      { class: this.SocialCollectionEntry, return: 'count' },
      {
        type: '&',
        qref: [
          [
            'collection',
            [
              { class: this.SocialCollection },
              { type: '&', equal: ['id', collectionId] },
            ],
          ],
        ],
      }
    );
  }

  async getContext(documentUrl: string) {
    // console.log('getContext', { documentUrl });

    return this.nymph.getEntity(
      { class: this.SocialContext, skipAc: true },
      { type: '&', equal: ['documentUrl', documentUrl] }
    );
  }

  async getUsercount() {
    // console.log('getUsercount');

    return await this.nymph.getEntities(
      { class: this.User, return: 'count', skipAc: true },
      { type: '&', truthy: 'enabled' }
    );
  }

  async saveContext(context: Context) {
    // console.log('saveContext', context);

    const contextEntity = await this.SocialContext.factory();

    contextEntity.contextUrl = context.contextUrl;
    contextEntity.documentUrl = context.documentUrl;
    contextEntity.document = context.document;

    if (!(await contextEntity.$saveSkipAC())) {
      throw new Error("Couldn't save context.");
    }
  }

  /**
   * Return true if it was saved and is new. Return false if saving failed.
   * Return undefined if it has already been saved (the ID exists).
   */
  async saveActivity(activity: APEXActivity | APEXIntransitiveActivity) {
    // console.log('saveActivity', activity);

    const activityEntity = await this.SocialActivity.factory();
    await activityEntity.$acceptAPObject(activity, true);

    try {
      return await activityEntity.$saveSkipAC();
    } catch (e: any) {
      if (e instanceof HttpError && e.status === 409) {
        return undefined;
      }

      throw e;
    }
  }

  async removeActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    actorId: string
  ) {
    // console.log('removeActivity', activity, { actorId });

    const activities = await this.nymph.getEntities(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', activity.id] },
      {
        type: '|',
        equal: ['actor', actorId],
        contain: ['actor', actorId],
        qref: [
          'actor',
          [{ class: this.SocialActor }, { type: '&', equal: ['id', actorId] }],
        ],
      }
    );

    activityLoop: for (let activityEntity of activities) {
      // Find all the entries for this activity.
      const entries = await this.nymph.getEntities(
        { class: this.SocialCollectionEntry, skipAc: true },
        { type: '&', ref: ['entry', activityEntity] }
      );

      for (let entry of entries) {
        if (!(await entry.$deleteSkipAC())) {
          continue activityLoop;
        }
      }

      await activityEntity.$delete();
    }
  }

  /**
   * Return the activity after updating it.
   */
  async updateActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    fullReplace: boolean
  ) {
    // console.log('updateActivity', activity, { fullReplace });

    const activityEntity = await this.nymph.getEntity(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', activity.id] }
    );

    if (!activityEntity) {
      throw new Error('Activity not found.');
    }

    await activityEntity.$acceptAPObject(activity, fullReplace);

    if (!(await activityEntity.$saveSkipAC())) {
      throw new Error("Couldn't save activity.");
    }

    return (await activityEntity.$toAPObject(true)) as APEXActivity;
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
    // console.log('updateActivityMeta', activity, { key, value, remove });

    const activityEntity = await this.nymph.getEntity(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', activity.id] }
    );

    if (!activityEntity) {
      throw new Error('Activity not found.');
    }

    if (remove) {
      if (activityEntity._meta && key in activityEntity._meta) {
        if (Array.isArray(activityEntity._meta[key])) {
          const idx = activityEntity._meta[key].indexOf(value);
          if (idx !== -1) {
            activityEntity._meta[key].splice(idx);
          }
        } else {
          delete activityEntity._meta[key];
        }
      }
    } else {
      if (!activityEntity._meta) {
        activityEntity._meta = {};
      }

      if (!(key in activityEntity._meta)) {
        activityEntity._meta[key] = [];
      } else if (typeof activityEntity._meta[key] === 'string') {
        activityEntity._meta[key] = [activityEntity._meta[key]];
      }

      activityEntity._meta[key].push(value);
    }

    if (!(await activityEntity.$saveSkipAC())) {
      throw new Error("Couldn't save activity.");
    }

    return (await activityEntity.$toAPObject(true)) as APEXActivity;
  }

  generateId() {
    // console.log('generateId');

    return guid();
  }

  async updateObject(
    object: APEXObject,
    _actorId: string,
    fullReplace: boolean
  ) {
    // console.log('updateObject', obj, {
    //   actorId,
    //   fullReplace,
    // });

    const objectEntity = await this.nymph.getEntity(
      { class: this.SocialObject, skipAc: true },
      { type: '&', equal: ['id', object.id] }
    );

    if (!objectEntity || !objectEntity.id) {
      throw new Error('Object not found.');
    }

    await objectEntity.$acceptAPObject(object, fullReplace);

    if (!(await objectEntity.$saveSkipAC())) {
      throw new Error("Couldn't save object.");
    }

    const activitiesWithObject = await this.nymph.getEntities(
      { class: this.SocialActivity, skipAc: true },
      {
        type: '&',
        contain: [
          ['object', object.id],
          ['object', 'type'],
        ],
      }
    );

    for (let activity of activitiesWithObject) {
      if (Array.isArray(activity.object)) {
        for (let i = 0; i <= activity.object.length; i++) {
          let curObject = activity.object[i];
          if (typeof curObject !== 'string' && curObject.type !== 'Link') {
            activity.object[i] = objectEntity.id;
          }
        }
      } else if (
        activity.object &&
        typeof activity.object !== 'string' &&
        activity.object.type !== 'Link'
      ) {
        activity.object = objectEntity.id;
      }

      await activity.$saveSkipAC();
    }

    return (await objectEntity.$toAPObject(true)) as APEXObject;
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
    // console.log('deliveryDequeue');

    const delivery = await this.nymph.getEntity(
      { class: this.SocialDelivery, sort: 'after', skipAc: true },
      { type: '&', lt: ['after', new Date().getTime()] }
    );

    if (delivery != null) {
      const value = {
        address: delivery.address,
        actorId: delivery.actorId,
        signingKey: delivery.signingKey,
        body: delivery.body,
        attempt: delivery.attempt,
        after: new Date(delivery.after),
      };

      await delivery.$deleteSkipAC();

      return value;
    }

    const next = await this.nymph.getEntity({
      class: this.SocialDelivery,
      sort: 'after',
      skipAc: true,
    });

    if (next != null) {
      return { waitUntil: new Date(next.after) };
    }

    return null;
  }

  async deliveryEnqueue(
    actorId: string,
    body: string,
    addresses: string | string[],
    signingKey: string
  ) {
    // console.log('deliveryEnqueue', {
    //   actorId,
    //   body,
    //   addresses,
    //   signingKey,
    // });

    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    for (let address of addresses) {
      const delivery = await this.SocialDelivery.factory();
      delivery.address = address;
      delivery.actorId = actorId;
      delivery.signingKey = signingKey;
      delivery.body = body;
      delivery.attempt = 0;
      delivery.after = new Date().getTime();

      await delivery.$saveSkipAC();
    }

    return true;
  }

  /**
   * Insert the delivery back into the DB after updating its `after` prop.
   */
  async deliveryRequeue(delivery: Delivery) {
    // console.log('deliveryRequeue', delivery);

    const deliveryEntity = await this.SocialDelivery.factory();
    deliveryEntity.address = delivery.address;
    deliveryEntity.actorId = delivery.actorId;
    deliveryEntity.signingKey = delivery.signingKey;
    deliveryEntity.body = delivery.body;
    deliveryEntity.attempt = delivery.attempt + 1;
    deliveryEntity.after =
      delivery.after.getTime() + Math.pow(10, deliveryEntity.attempt);

    if (!(await deliveryEntity.$saveSkipAC())) {
      throw new Error("Couldn't save delivery.");
    }
  }
}
