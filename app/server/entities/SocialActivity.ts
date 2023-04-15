import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import type { SchemaMap } from 'joi';
import type { APLink, APActivity, APActor, APObject } from '_activitypub';

import {
  SocialObjectBase,
  apLinkJoi,
  apObjectOrLinkJoi,
  apObjectOrLinkOrArrayJoi,
  apObjectJoiBuilder,
} from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import { socialObjectJoiProps } from './SocialObject.js';
import { apActorJoiBuilder } from './SocialActor.js';

export type SocialActivityData = SocialObjectBaseData & {
  type:
    | 'Accept'
    | 'TentativeAccept'
    | 'Add'
    | 'Arrive'
    | 'Create'
    | 'Delete'
    | 'Follow'
    | 'Ignore'
    | 'Join'
    | 'Leave'
    | 'Like'
    | 'Offer'
    | 'Invite'
    | 'Reject'
    | 'TentativeReject'
    | 'Remove'
    | 'Undo'
    | 'Update'
    | 'View'
    | 'Listen'
    | 'Read'
    | 'Move'
    | 'Travel'
    | 'Announce'
    | 'Block'
    | 'Flag'
    | 'Dislike'
    | 'Question';
  actor: APLink | APActor | (APLink | APActor)[];
  object?: APLink | APObject | (APLink | APObject)[];
  target?: APLink | APObject | (APLink | APObject)[];
  result?: APLink | APObject | (APLink | APObject)[];
  origin?: APLink | APObject | (APLink | APObject)[];
  instrument?: APLink | APObject | (APLink | APObject)[];

  anyOf?: APLink | APObject | (APLink | APObject)[];
  oneOf?: APLink | APObject | (APLink | APObject)[];
  closed?:
    | APObject
    | APLink
    | string
    | boolean
    | (APObject | APLink | string | boolean)[];
};

export class SocialActivity extends SocialObjectBase<SocialActivityData> {
  static ETYPE = 'socialactivity';
  static class = 'SocialActivity';

  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  private $skipAcWhenSaving = false;

  static async factory(
    guid?: string
  ): Promise<SocialActivity & SocialActivityData> {
    return (await super.factory(guid)) as SocialActivity & SocialActivityData;
  }

  static factorySync(guid?: string): SocialActivity & SocialActivityData {
    return super.factorySync(guid) as SocialActivity & SocialActivityData;
  }

  static async factoryId(
    id?: string
  ): Promise<SocialActivity & SocialActivityData> {
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
      this.$data.type = 'Create';
      this.$data.fullType = ['Create'];
    }
  }

  async $acceptAPObject(obj: APActivity, fullReplace: boolean) {
    super.$acceptAPObject(obj, fullReplace);

    if (Array.isArray(obj.type)) {
      for (const entry of obj.type) {
        if (
          entry === 'Accept' ||
          entry === 'TentativeAccept' ||
          entry === 'Add' ||
          entry === 'Arrive' ||
          entry === 'Create' ||
          entry === 'Delete' ||
          entry === 'Follow' ||
          entry === 'Ignore' ||
          entry === 'Join' ||
          entry === 'Leave' ||
          entry === 'Like' ||
          entry === 'Offer' ||
          entry === 'Invite' ||
          entry === 'Reject' ||
          entry === 'TentativeReject' ||
          entry === 'Remove' ||
          entry === 'Undo' ||
          entry === 'Update' ||
          entry === 'View' ||
          entry === 'Listen' ||
          entry === 'Read' ||
          entry === 'Move' ||
          entry === 'Travel' ||
          entry === 'Announce' ||
          entry === 'Block' ||
          entry === 'Flag' ||
          entry === 'Dislike' ||
          entry === 'Question'
        ) {
          this.$data.type = entry;
          break;
        }
      }
    } else if (
      obj.type === 'Accept' ||
      obj.type === 'TentativeAccept' ||
      obj.type === 'Add' ||
      obj.type === 'Arrive' ||
      obj.type === 'Create' ||
      obj.type === 'Delete' ||
      obj.type === 'Follow' ||
      obj.type === 'Ignore' ||
      obj.type === 'Join' ||
      obj.type === 'Leave' ||
      obj.type === 'Like' ||
      obj.type === 'Offer' ||
      obj.type === 'Invite' ||
      obj.type === 'Reject' ||
      obj.type === 'TentativeReject' ||
      obj.type === 'Remove' ||
      obj.type === 'Undo' ||
      obj.type === 'Update' ||
      obj.type === 'View' ||
      obj.type === 'Listen' ||
      obj.type === 'Read' ||
      obj.type === 'Move' ||
      obj.type === 'Travel' ||
      obj.type === 'Announce' ||
      obj.type === 'Block' ||
      obj.type === 'Flag' ||
      obj.type === 'Dislike' ||
      obj.type === 'Question'
    ) {
      this.$data.type = obj.type;
    }
    this.$data.fullType = obj.type;
  }

  async $toAPObject(includeMeta: boolean): Promise<APActivity> {
    return (await super.$toAPObject(includeMeta)) as APActivity;
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

    // Check that this activity doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialActivity,
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
      throw new HttpError('That activity already exists.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        apActivityJoiBuilder({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          ...socialObjectJoiProps,
          ...socialActivityJoiProps,
        }),
        'Invalid SocialActivity: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (JSON.stringify(this.$getValidatable()).length > 50 * 1024) {
      throw new HttpError(
        'This server has a max of 50KiB for activities.',
        413
      );
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

export const apActivityJoiBuilder = (additionalKeys: SchemaMap<any> = {}) =>
  apObjectJoiBuilder({
    actor: Joi.alternatives()
      .try(
        apLinkJoi,
        apActorJoiBuilder(),
        apObjectJoiBuilder(),
        Joi.array().items(
          Joi.alternatives().try(
            apLinkJoi,
            apActorJoiBuilder(),
            apObjectJoiBuilder()
          )
        )
      )
      .required(),
    object: apObjectOrLinkOrArrayJoi,
    target: apObjectOrLinkOrArrayJoi,
    result: apObjectOrLinkOrArrayJoi,
    origin: apObjectOrLinkOrArrayJoi,
    instrument: apObjectOrLinkOrArrayJoi,

    anyOf: apObjectOrLinkOrArrayJoi,
    oneOf: apObjectOrLinkOrArrayJoi,
    closed: Joi.alternatives().try(
      apObjectOrLinkJoi,
      Joi.string().uri(),
      Joi.boolean(),
      Joi.array().items(
        Joi.alternatives().try(
          apObjectOrLinkJoi,
          Joi.string().uri(),
          Joi.boolean()
        )
      )
    ),

    ...additionalKeys,
  });

export const socialActivityJoiProps = {
  type: Joi.any()
    .valid(
      'Accept',
      'TentativeAccept',
      'Add',
      'Arrive',
      'Create',
      'Delete',
      'Follow',
      'Ignore',
      'Join',
      'Leave',
      'Like',
      'Offer',
      'Invite',
      'Reject',
      'TentativeReject',
      'Remove',
      'Undo',
      'Update',
      'View',
      'Listen',
      'Read',
      'Move',
      'Travel',
      'Announce',
      'Block',
      'Flag',
      'Dislike',
      'Question'
    )
    .required(),
};
