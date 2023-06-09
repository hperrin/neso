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
import { SocialDelivery as SocialDeliveryClass } from './entities/SocialDelivery.js';
import { SocialActivity as SocialActivityClass } from './entities/SocialActivity.js';
import { SocialActor as SocialActorClass } from './entities/SocialActor.js';
import { SocialObject as SocialObjectClass } from './entities/SocialObject.js';

import { DOMAIN, ADDRESS } from './nymph.js';
import { AP_ROUTES, AP_USER_ID_PREFIX } from './utils/constants.js';
import {
  isActivity,
  isActor,
  isCollection,
  isCollectionPage,
  isObject,
  isSocialCollection,
  isSocialCollectionPage,
} from './utils/checkTypes.js';

export function buildApex(nymph: Nymph) {
  const store = new ApexStore(nymph);

  const apex = ActivitypubExpress({
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

  store.setApex(apex);

  return apex;
}

class ApexStore implements IApexStore {
  nymph: Nymph;
  User: typeof UserClass;
  SocialContext: typeof SocialContextClass;
  SocialDelivery: typeof SocialDeliveryClass;
  SocialActivity: typeof SocialActivityClass;
  SocialActor: typeof SocialActorClass;
  SocialObject: typeof SocialObjectClass;

  apex: ReturnType<typeof ActivitypubExpress>;

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
    this.SocialObject = nymph.getEntityClass(
      SocialObjectClass.class
    ) as typeof SocialObjectClass;

    this.apex = {} as unknown as ReturnType<typeof ActivitypubExpress>;
  }

  setApex(apex: ReturnType<typeof ActivitypubExpress>) {
    this.apex = apex;

    this.nymph
      .getEntity(
        { class: this.SocialActor, skipAc: true },
        { type: '&', equal: ['id', `${AP_USER_ID_PREFIX(ADDRESS)}root`] }
      )
      .then((actor) => {
        if (actor) {
          actor
            .$toAPObject(true)
            .then((apActor) => {
              this.apex.systemUser = apActor;
            })
            .catch((e) => {
              console.error('Error:', e);
            });
        }
      })
      .catch((e) => {
        console.error('Error:', e);
      });
  }

  async setup(_optionalActor: APEXActor) {
    console.log('setup');
  }

  async getObject(id: string, includeMeta?: boolean) {
    console.log('getObject', { id, includeMeta });

    if (typeof id !== 'string') {
      return null;
    }

    // Look for an actor.
    const actor = await this.SocialActor.factoryId(id);
    if (actor.guid != null) {
      return await this.apex.fromJSONLD(
        (await actor.$toAPObject(!!includeMeta)) as APEXActor
      );
    } else if (id.startsWith(AP_USER_ID_PREFIX(ADDRESS))) {
      // This is a user who doesn't have an actor object yet. That's an error.
      throw new Error(`Local user doesn't have SocialActor entity! ${id}`);
    }

    // Look for an object.
    const object = await this.SocialObject.factoryId(id);
    if (object.guid != null) {
      if (isSocialCollection(object) || isSocialCollectionPage(object)) {
        // We save collections, but APEX should always request them anew.
        // TODO: is this necessary? something to look at after the hackathon.
        return null;
      }

      return await this.apex.fromJSONLD(
        (await object.$toAPObject(!!includeMeta)) as APEXObject
      );
    }

    return null;
  }

  async saveObject(object: APEXObject) {
    console.log('saveObject (unformatted)', object);
    const formattedObject = await this.apex.toJSONLD(object);
    console.log('saveObject (formatted', formattedObject);

    try {
      if (isActivity(formattedObject)) {
        const obj = await this.SocialActivity.factory();
        await obj.$acceptAPObject(formattedObject, true);

        return await obj.$saveSkipAC();
      }

      if (isActor(formattedObject)) {
        const obj = await this.SocialActor.factory();
        await obj.$acceptAPObject(formattedObject, true);

        return await obj.$saveSkipAC();
      }

      if (isObject(formattedObject)) {
        if (
          isCollection(formattedObject) ||
          isCollectionPage(formattedObject)
        ) {
          // Delete the previous version of the collection.
          const obj = await this.SocialObject.factoryId(formattedObject.id);

          if (obj.guid != null) {
            await obj.$deleteSkipAC();
          }
        }

        const obj = await this.SocialObject.factory();
        await obj.$acceptAPObject(formattedObject, true);

        return await obj.$saveSkipAC();
      }
    } catch (e: any) {
      if (e instanceof HttpError && e.status === 409) {
        // Object is already saved.
        return true;
      }

      console.error('Error:', e);
      throw e;
    }

    console.error(
      'Unsupported object type:',
      (formattedObject as { type?: string }).type
    );
    throw new Error('Unsupported object type.');
  }

  async getActivity(id: string, includeMeta?: boolean) {
    console.log('getActivity', { id, includeMeta });

    // Look for an activity.
    const activity = await this.SocialActivity.factoryId(id);
    if (activity.guid != null) {
      return await this.apex.fromJSONLD(
        (await activity.$toAPObject(!!includeMeta)) as APEXActivity
      );
    }

    return null;
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

    const entity = await this.nymph.getEntity(
      { class: this.SocialActivity },
      {
        type: '&',
        contain: ['_meta', collection],
      },
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
      }
    );
    if (entity) {
      return await this.apex.fromJSONLD(
        (await entity.$toAPObject(includeMeta)) as APEXActivity
      );
    }
    return null;
  }

  async findActivityByCollectionAndActorId(
    collection: string,
    actorId: string,
    includeMeta?: boolean
  ) {
    console.log('findActivityByCollectionAndActorId', {
      collection,
      actorId,
      includeMeta,
    });

    const entity = await this.nymph.getEntity(
      { class: this.SocialActivity },
      {
        type: '&',
        contain: ['_meta', collection],
      },
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
    if (entity) {
      return await this.apex.fromJSONLD(
        (await entity.$toAPObject(!!includeMeta)) as APEXActivity
      );
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
    console.log('getStream', {
      collectionId,
      limit,
      after,
      blockList,
      query,
    });

    let afterEntry = after ? await this.SocialActivity.factoryId(after) : null;
    if (afterEntry && afterEntry.guid == null) {
      throw new Error("Couldn't find last activity.");
    }

    const entries = await this.nymph.getEntities(
      {
        class: this.SocialActivity,
        sort: 'cdate',
        reverse: true,
        ...(limit != null ? { limit } : {}),
      },
      {
        type: '&',
        contain: ['_meta', collectionId],
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
            } as Selector,
          ]
        : [])
    );

    return (await Promise.all(
      entries.map(
        async (e) =>
          await this.apex.fromJSONLD(await e.entry.$toAPObject(false))
      )
    )) as APEXActivity[];
  }

  async getStreamCount(collectionId: string) {
    console.log('getStreamCount', { collectionId });
    return await this.nymph.getEntities(
      { class: this.SocialActivity, return: 'count' },
      {
        type: '&',
        contain: ['_meta', collectionId],
      }
    );
  }

  async getContext(documentUrl: string) {
    console.log('getContext', { documentUrl });

    const contextEntity = await this.nymph.getEntity(
      { class: this.SocialContext, skipAc: true },
      { type: '&', equal: ['documentUrl', documentUrl] }
    );

    if (contextEntity) {
      return await contextEntity.$toJsonContext();
    }

    return null;
  }

  async getUsercount() {
    console.log('getUsercount');

    return await this.nymph.getEntities(
      { class: this.User, return: 'count', skipAc: true },
      { type: '&', truthy: 'enabled' }
    );
  }

  async saveContext(context: Context) {
    console.log('saveContext', context);

    const contextEntity = await this.SocialContext.factory();

    contextEntity.$acceptJsonContext(context, true);

    try {
      if (!(await contextEntity.$saveSkipAC())) {
        throw new Error("Couldn't save context.");
      }
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }
  }

  /**
   * Return true if it was saved and is new. Return false if saving failed.
   * Return undefined if it has already been saved (the ID exists).
   */
  async saveActivity(activity: APEXActivity | APEXIntransitiveActivity) {
    console.log('saveActivity (unformatted)', activity);
    const formattedActivity = await this.apex.toJSONLD(activity);
    console.log('saveActivity (formatted)', formattedActivity);

    const activityEntity = await this.SocialActivity.factory();
    await activityEntity.$acceptAPObject(formattedActivity, true);

    try {
      return await activityEntity.$saveSkipAC();
    } catch (e: any) {
      if (e instanceof HttpError && e.status === 409) {
        return undefined;
      }

      console.error('Error:', e);
      throw e;
    }
  }

  async removeActivity(
    activity: APEXActivity | APEXIntransitiveActivity,
    actorId: string
  ) {
    console.log('removeActivity (unformatted)', activity, { actorId });
    const formattedActivity = await this.apex.toJSONLD(activity);
    console.log('removeActivity (formatted)', formattedActivity, { actorId });

    const activities = await this.nymph.getEntities(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', formattedActivity.id] },
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

    for (let activityEntity of activities) {
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
    console.log('updateActivity (unformatted)', activity, { fullReplace });
    const formattedActivity = await this.apex.toJSONLD(activity);
    console.log('updateActivity (formatted)', formattedActivity, {
      fullReplace,
    });

    const activityEntity = await this.nymph.getEntity(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', formattedActivity.id] }
    );

    if (!activityEntity) {
      throw new Error('Activity not found.');
    }

    await activityEntity.$acceptAPObject(formattedActivity, fullReplace);

    try {
      if (!(await activityEntity.$saveSkipAC())) {
        throw new Error("Couldn't save activity.");
      }
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }

    return await this.apex.fromJSONLD(
      (await activityEntity.$toAPObject(true)) as APEXActivity
    );
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
    console.log('updateActivityMeta (unformatted)', activity, {
      key,
      value,
      remove,
    });
    const formattedActivity = await this.apex.toJSONLD(activity);
    console.log('updateActivityMeta (formatted)', formattedActivity, {
      key,
      value,
      remove,
    });

    if (key !== 'collection') {
      throw new Error(
        'APEX has started using another Activity meta key than "collection"! This is an issue.'
      );
    }

    const activityEntity = await this.nymph.getEntity(
      { class: this.SocialActivity, skipAc: true },
      { type: '&', equal: ['id', formattedActivity.id] }
    );

    if (!activityEntity) {
      throw new Error('Activity not found.');
    }

    if (remove) {
      if (activityEntity._meta && key in activityEntity._meta) {
        if (Array.isArray(activityEntity._meta[key])) {
          const idx = (activityEntity._meta[key] as string[]).indexOf(value);
          if (idx !== -1) {
            (activityEntity._meta[key] as string[]).splice(idx);
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
        activityEntity._meta[key] = [
          activityEntity._meta[key] as unknown as string,
        ];
      }

      (activityEntity._meta[key] as string[]).push(value);
    }

    try {
      if (!(await activityEntity.$saveSkipAC())) {
        throw new Error("Couldn't save activity.");
      }
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }

    return await this.apex.fromJSONLD(
      (await activityEntity.$toAPObject(true)) as APEXActivity
    );
  }

  generateId() {
    console.log('generateId');

    return guid();
  }

  async updateObject(
    object: APEXObject,
    actorId: string,
    fullReplace: boolean
  ) {
    console.log('updateObject (unformatted)', object, {
      actorId,
      fullReplace,
    });
    const formattedObject = await this.apex.toJSONLD(object);
    console.log('updateObject (formatted)', formattedObject, {
      actorId,
      fullReplace,
    });

    const objectEntity = await this.nymph.getEntity(
      { class: this.SocialObject, skipAc: true },
      { type: '&', equal: ['id', formattedObject.id] }
    );

    if (!objectEntity || !objectEntity.id) {
      throw new Error('Object not found.');
    }

    await objectEntity.$acceptAPObject(formattedObject, fullReplace);

    try {
      if (!(await objectEntity.$saveSkipAC())) {
        throw new Error("Couldn't save object.");
      }
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }

    const activitiesWithObject = await this.nymph.getEntities(
      { class: this.SocialActivity, skipAc: true },
      {
        type: '&',
        contain: [
          ['object', formattedObject.id],
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

      try {
        await activity.$saveSkipAC();
      } catch (e) {
        console.error('Error:', e);
        throw e;
      }
    }

    return await this.apex.fromJSONLD(
      (await objectEntity.$toAPObject(true)) as APEXObject
    );
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
    console.log('deliveryEnqueue', {
      actorId,
      body,
      addresses,
      signingKey,
    });

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

      try {
        await delivery.$saveSkipAC();
      } catch (e) {
        console.error('Error:', e);
        throw e;
      }
    }

    return true;
  }

  /**
   * Insert the delivery back into the DB after updating its `after` prop.
   */
  async deliveryRequeue(delivery: Delivery) {
    console.log('deliveryRequeue', delivery);

    const deliveryEntity = await this.SocialDelivery.factory();
    deliveryEntity.address = delivery.address;
    deliveryEntity.actorId = delivery.actorId;
    deliveryEntity.signingKey = delivery.signingKey;
    deliveryEntity.body = delivery.body;
    deliveryEntity.attempt = delivery.attempt + 1;
    deliveryEntity.after =
      delivery.after.getTime() + Math.pow(10, deliveryEntity.attempt);

    try {
      if (!(await deliveryEntity.$saveSkipAC())) {
        throw new Error("Couldn't save delivery.");
      }
    } catch (e) {
      console.error('Error:', e);
      throw e;
    }
  }
}
