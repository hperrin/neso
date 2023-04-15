declare module 'activitypub-express' {
  import {
    APObject,
    APActivity,
    APIntransitiveActivity,
    APActor,
  } from '_activitypub';

  const ActivitypubExpress: any;

  export default ActivitypubExpress;

  export interface Context {
    contextUrl: string;
    documentUrl: string;
    document: any;
  }

  export interface PublicKey {
    id: string;
    owner: string;
    publicKeyPem: string;
  }

  export interface APEXObject extends APObject {
    id: string;
  }

  export interface APEXActor extends APActor {
    id: string;
  }

  export interface APEXActivity extends APActivity {
    id: string;
    actor: string[];
  }

  export interface APEXIntransitiveActivity extends APIntransitiveActivity {
    actor: string[];
  }

  export interface Delivery {
    after: Date;
    attempt: number;
    actorId: string;
    body: string;
    address: string;
    signingKey: string;
  }

  export interface IApexStore {
    /**
     * Perform DB setup.
     */
    setup(optionalActor: APEXActor): Promise<void>;

    getObject(id: string, includeMeta: boolean): Promise<APEXObject>;

    saveObject(object: APEXObject): Promise<boolean>;

    getActivity(
      id: string,
      includeMeta: boolean
    ): Promise<APEXActivity | APEXIntransitiveActivity>;

    findActivityByCollectionAndObjectId(
      collection: string,
      objectId: string,
      includeMeta: boolean
    ): Promise<APEXActivity | APEXIntransitiveActivity | null>;

    findActivityByCollectionAndActorId(
      collection: string,
      actorId: string,
      includeMeta: boolean
    ): Promise<APEXActivity | APEXIntransitiveActivity | null>;

    /**
     * Return a specific collection (stream of activitites), e.g. a user's inbox
     * @param collectionId collection identifier
     * @param limit max number of activities to return
     * @param after id to begin querying after (i.e. last item of last page)
     * @param blockList list of ids of actors whose activities should be excluded
     * @param query additional query/aggregation
     */
    getStream(
      collectionId: string,
      limit?: number | null,
      after?: string | null,
      blockList?: string[],
      query?: any
    ): Promise<(APEXActivity | APEXIntransitiveActivity)[]>;

    getStreamCount(collectionId: string): Promise<number>;

    getContext(documentUrl: string): Promise<Context>;

    getUsercount(): Promise<number>;

    saveContext(context: Context): Promise<void>;

    /**
     * Return true if it was saved and is new. Return false if saving failed.
     * Return undefined if it has already been saved (the ID exists).
     */
    saveActivity(
      activity: APEXActivity | APEXIntransitiveActivity
    ): Promise<boolean | undefined>;

    removeActivity(
      activity: APEXActivity | APEXIntransitiveActivity,
      actorId: string
    ): any;

    /**
     * Return the activity after updating it.
     */
    updateActivity(
      activity: APEXActivity | APEXIntransitiveActivity,
      fullReplace: boolean
    ): Promise<APEXActivity | APEXIntransitiveActivity>;

    /**
     * Return the activity after updating the meta.
     */
    updateActivityMeta(
      activity: APEXActivity | APEXIntransitiveActivity,
      key: string,
      value: any,
      remove: boolean
    ): Promise<APEXActivity | APEXIntransitiveActivity>;

    generateId(): string;

    updateObject(
      obj: APEXObject,
      actorId: string,
      fullReplace: boolean
    ): Promise<any>;

    /**
     * Find the first deliver where `after` is less than `new Date()`, delete
     * it, and return it.
     *
     * If none exist, find the next delivery, and return a `waitUntil` for its
     * `after`.
     *
     * If no deliveries exist, return null.
     */
    deliveryDequeue(): Promise<Delivery | { waitUntil: Date } | null>;

    deliveryEnqueue(
      actorId: string,
      body: string,
      addresses: string | string[],
      signingKey: string
    ): Promise<boolean>;

    /**
     * Insert the delivery back into the DB after updating its `after` prop.
     */
    deliveryRequeue(delivery: Delivery): Promise<void>;
  }
}
