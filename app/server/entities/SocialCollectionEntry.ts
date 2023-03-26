import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

import { SocialCollection } from './SocialCollection.js';
import type { SocialCollectionData } from './SocialCollection.js';
import { SocialObjectBase } from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';

export type SocialCollectionEntryData = {
  collection: SocialCollection & SocialCollectionData;
  entry: SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData;
};

export class SocialCollectionEntry extends Entity<SocialCollectionEntryData> {
  static ETYPE = 'socialcollectionentry';
  static class = 'SocialCollectionEntry';

  protected $allowlistData = ['collection', 'entry'];
  protected $allowlistTags = [];

  static async factory(
    guid?: string
  ): Promise<SocialCollectionEntry & SocialCollectionEntryData> {
    return (await super.factory(guid)) as SocialCollectionEntry &
      SocialCollectionEntryData;
  }

  static factorySync(
    guid?: string
  ): SocialCollectionEntry & SocialCollectionEntryData {
    return super.factorySync(guid) as SocialCollectionEntry &
      SocialCollectionEntryData;
  }

  constructor(guid?: string) {
    super(guid);
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          collection: Joi.object().instance(SocialCollection).required(),
          entry: Joi.object().instance(SocialObjectBase).required(),
        }),
        'Invalid SocialCollectionEntry: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    return await super.$save();
  }
}
