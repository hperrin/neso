import { Entity } from '@nymphjs/client';

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
    | 'Tombstone';
};

export class SocialObject extends Entity<SocialObjectData> {
  // The name of the server class
  public static class = 'SocialObject';

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
}
