import { Entity, HttpError } from '@nymphjs/client';

import type { SocialActivity as SocialActivityClass } from './SocialActivity.js';
import type { SocialActor as SocialActorClass } from './SocialActor.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';

export type SocialObjectData = SocialObjectBaseData & {
  type:
    | 'Object'
    | 'Relationship'
    | 'Article'
    | 'Article'
    | 'Document'
    | 'Audio'
    | 'Image'
    | 'Video'
    | 'Note'
    | 'Page'
    | 'Event'
    | 'Place'
    | 'Mention'
    | 'Profile'
    | 'Tombstone'
    | 'Collection'
    | 'OrderedCollection'
    | 'CollectionPage'
    | 'OrderedCollectionPage';
};

export class SocialObject extends Entity<SocialObjectData> {
  // The name of the server class
  public static class = 'SocialObject';

  public static ADDRESS = 'http://127.0.0.1:5173';

  public $level = 0;

  constructor(guid?: string) {
    super(guid);
  }

  static async factory(
    guid?: string
  ): Promise<SocialObject & SocialObjectData> {
    return (await super.factory(guid)) as SocialObject & SocialObjectData;
  }

  static factorySync(guid?: string): SocialObject & SocialObjectData {
    return super.factorySync(guid) as SocialObject & SocialObjectData;
  }

  static async factoryId(
    id?: string
  ): Promise<SocialObject & SocialObjectData> {
    const entity = this.factorySync();
    if (id != null) {
      const entity = await this.nymph.getEntity(
        {
          class: this,
        },
        { type: '&', equal: ['id', id] }
      );
      if (entity != null) {
        return entity;
      }
    }
    return entity;
  }

  static async getId(id: string) {
    const Actor = this.nymph.getEntityClass(
      'SocialActor'
    ) as typeof SocialActorClass;
    const Activity = this.nymph.getEntityClass(
      'SocialActivity'
    ) as typeof SocialActivityClass;
    const Object = this.nymph.getEntityClass(
      'SocialObject'
    ) as typeof SocialObject;

    const getObject = async (id: string) => {
      try {
        // Try to find an activity.
        const activity = await this.nymph.getEntity(
          { class: Activity },
          { type: '&', equal: ['id', id] }
        );
        if (activity != null) {
          return activity;
        }
      } catch (e: any) {
        if (!(e instanceof HttpError) || e.status !== 404) {
          throw e;
        }
      }

      try {
        // Try to find an object.
        const object = await this.nymph.getEntity(
          { class: Object },
          { type: '&', equal: ['id', id] }
        );
        if (object != null) {
          return object;
        }
      } catch (e: any) {
        if (!(e instanceof HttpError) || e.status !== 404) {
          throw e;
        }
      }

      try {
        // Try to find an actor.
        const actor = await this.nymph.getEntity(
          { class: Actor },
          { type: '&', equal: ['id', id] }
        );
        if (actor != null) {
          return actor;
        }
      } catch (e: any) {
        if (!(e instanceof HttpError) || e.status !== 404) {
          throw e;
        }
      }

      return null;
    };

    // Try to get the object.
    const object = await getObject(id);

    // If the object is found, we're done.
    if (object != null) {
      return object;
    }

    // If the object is on another server, try to get it.
    if (!id.startsWith(`${this.ADDRESS}/`)) {
      const result = await this.getProxy(id);
      if (!result.ok) {
        return null;
      }

      // It was found, so now we can request it again.
      return await getObject(id);
    }

    // Nothing was found.
    return null;
  }

  static async getLocal(id: string) {
    return await fetch(id, {
      method: 'GET',
      headers: {
        Accept: 'application/activity+json',
      },
    });
  }

  static async getProxy(id: string) {
    return await fetch(`${this.ADDRESS}/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/activity+json',
      },
      body: `id=${encodeURIComponent(id)}`,
    });
  }

  async $send() {
    return await this.$serverCall('$send', [], true);
  }
}
