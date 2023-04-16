import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import type { APObject } from '_activitypub';

import { SocialObjectBase, apObjectJoiBuilder } from './SocialObjectBase.js';
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

export class SocialObject extends SocialObjectBase<SocialObjectData> {
  static ETYPE = 'socialobject';
  static class = 'SocialObject';

  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  private $skipAcWhenSaving = false;

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

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.type = 'Object';
      this.$data.fullType = ['Object'];
    }
  }

  async $acceptAPObject(obj: APObject, fullReplace: boolean) {
    super.$acceptAPObject(obj, fullReplace);

    this.$data.type = 'Object';
    if (Array.isArray(obj.type)) {
      for (const entry of obj.type) {
        if (
          entry === 'Relationship' ||
          entry === 'Article' ||
          entry === 'Document' ||
          entry === 'Audio' ||
          entry === 'Image' ||
          entry === 'Video' ||
          entry === 'Note' ||
          entry === 'Page' ||
          entry === 'Event' ||
          entry === 'Place' ||
          entry === 'Profile' ||
          entry === 'Tombstone'
        ) {
          this.$data.type = entry;
          break;
        }
      }
    } else if (
      obj.type === 'Relationship' ||
      obj.type === 'Article' ||
      obj.type === 'Document' ||
      obj.type === 'Audio' ||
      obj.type === 'Image' ||
      obj.type === 'Video' ||
      obj.type === 'Note' ||
      obj.type === 'Page' ||
      obj.type === 'Event' ||
      obj.type === 'Place' ||
      obj.type === 'Profile' ||
      obj.type === 'Tombstone'
    ) {
      this.$data.type = obj.type;
    }
    this.$data.fullType = obj.type;
  }

  async $save() {
    if (!this.$skipAcWhenSaving && !this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
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

    // Check that this object doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialObject,
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
      throw new HttpError('That object already exists.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        apObjectJoiBuilder({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          ...socialObjectJoiProps,
        }),
        'Invalid SocialObject: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (JSON.stringify(this.$getValidatable()).length > 50 * 1024) {
      throw new HttpError('This server has a max of 50KiB for objects.', 413);
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

export const socialObjectJoiProps = {
  type: Joi.any()
    .valid(
      'Object',
      'Relationship',
      'Article',
      'Document',
      'Audio',
      'Image',
      'Video',
      'Note',
      'Page',
      'Event',
      'Place',
      'Profile',
      'Tombstone'
    )
    .required(),
  fullType: Joi.alternatives()
    .try(
      Joi.string().max(512).trim(false),
      Joi.array().items(Joi.string().max(512).trim(false))
    )
    .required(),

  endTime: Joi.number(),
  published: Joi.number(),
  startTime: Joi.number(),
  updated: Joi.number(),

  _meta: Joi.object(),
};
