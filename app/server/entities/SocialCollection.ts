import type { Selector } from '@nymphjs/nymph';
import { Entity, nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import type { AccessControlData } from '@nymphjs/tilmeld';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type SocialCollectionData = {
  id: string;
} & AccessControlData;

export class SocialCollection extends Entity<SocialCollectionData> {
  static ETYPE = 'socialcollection';
  static class = 'SocialCollection';

  protected $allowlistData = [];
  protected $allowlistTags = [];

  private $skipAcWhenSaving = false;
  private $skipAcWhenDeleting = false;

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

  async $delete() {
    if (!this.$skipAcWhenDeleting) {
      throw new HttpError('Only allowed by the server.', 403);
    }
    this.$skipAcWhenDeleting = false;

    return await super.$delete();
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $deleteSkipAC() {
    this.$skipAcWhenDeleting = true;
    return await this.$delete();
  }

  public $tilmeldDeleteSkipAC() {
    if (this.$skipAcWhenDeleting) {
      this.$skipAcWhenDeleting = false;
      return true;
    }
    return false;
  }
}
