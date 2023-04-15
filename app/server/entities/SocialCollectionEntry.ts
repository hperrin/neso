import type { Selector } from '@nymphjs/nymph';
import { Entity, nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import type { AccessControlData } from '@nymphjs/tilmeld';
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
} & AccessControlData;

export class SocialCollectionEntry extends Entity<SocialCollectionEntryData> {
  static ETYPE = 'socialcollectionentry';
  static class = 'SocialCollectionEntry';

  protected $allowlistData = ['collection', 'entry'];
  protected $allowlistTags = [];

  private $skipAcWhenSaving = false;

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
    if (!this.$skipAcWhenSaving) {
      throw new HttpError('Only allowed by the server.', 403);
    }

    if (this.$data.user != null) {
      if (this.$data.group == null) {
        this.$data.group = this.$data.user?.group;
      }

      if (this.$data.acUser == null) {
        this.$data.acUser = TilmeldAccessLevels.FULL_ACCESS;
      }
      if (this.$data.acGroup == null) {
        this.$data.acGroup = TilmeldAccessLevels.FULL_ACCESS;
      }
      if (this.$data.acOther == null) {
        this.$data.acOther = TilmeldAccessLevels.READ_ACCESS;
      }

      if (this.$data.acRead == null) {
        this.$data.acRead = [];
      }
      if (this.$data.acWrite == null) {
        this.$data.acWrite = [];
      }
      if (this.$data.acFull == null) {
        this.$data.acFull = [];
      }
    } else {
      if (this.$data.acUser == null) {
        this.$data.acUser = TilmeldAccessLevels.READ_ACCESS;
      }
      if (this.$data.acGroup == null) {
        this.$data.acGroup = TilmeldAccessLevels.READ_ACCESS;
      }
      if (this.$data.acOther == null) {
        this.$data.acOther = TilmeldAccessLevels.READ_ACCESS;
      }
    }

    if (this.$data.collection.guid == null || this.$data.entry.guid == null) {
      throw new HttpError(
        'A collection and an entry need to be specified.',
        400
      );
    }

    // Check that this entry doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialCollectionEntry,
        },
        {
          type: '&',
          ref: [
            ['collection', this.$data.collection.guid],
            ['entry', this.$data.entry.guid],
          ],
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
      throw new HttpError(
        'That entry already belongs to that collection.',
        409
      );
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

  /*
   * This should *never* be accessible on the client.
   */
  public async $saveSkipAC() {
    this.$skipAcWhenSaving = true;
    return await this.$save();
  }

  public $tilmeldSaveSkipAC() {
    if (this.$skipAcWhenSaving) {
      this.$skipAcWhenSaving = false;
      return true;
    }
    return false;
  }
}
