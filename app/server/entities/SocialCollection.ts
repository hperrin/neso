import type { Selector } from '@nymphjs/nymph';
import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type SocialCollectionData = {
  id: string;
};

export class SocialCollection extends Entity<SocialCollectionData> {
  static ETYPE = 'socialcollection';
  static class = 'SocialCollection';

  protected $allowlistData = ['id'];
  protected $allowlistTags = [];

  static async factory(
    guid?: string
  ): Promise<SocialCollection & SocialCollectionData> {
    return (await super.factory(guid)) as SocialCollection &
      SocialCollectionData;
  }

  static factorySync(guid?: string): SocialCollection & SocialCollectionData {
    return super.factorySync(guid) as SocialCollection & SocialCollectionData;
  }

  static async factoryId(
    id?: string
  ): Promise<SocialCollection & SocialCollectionData> {
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

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.id = '';
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Check that this collection doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialCollection,
        },
        {
          type: '&',
          equal: ['id', this.$data.id],
        },
        ...(this.guid
          ? [
              {
                type: '&',
                '!guid': this.guid,
              } as Selector,
            ]
          : [])
      )
    ) {
      throw new HttpError('That collection already exists.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          id: Joi.string().max(1024).trim(false).required(),
        }),
        'Invalid SocialCollection: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    return await super.$save();
  }
}
