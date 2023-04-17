import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import type { Tilmeld } from '@nymphjs/tilmeld';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import { guid } from '@nymphjs/guid';
import Joi from 'joi';
import type { SchemaMap } from 'joi';
import fetch from 'node-fetch';
import type { APLink, APActivity, APActor, APObject } from '_activitypub';
import ActivitypubExpress from 'activitypub-express';

import {
  AP_PUBLIC_ADDRESS,
  AP_USER_ID_PREFIX,
  AP_USER_OUTBOX_PREFIX,
  AP_USER_INBOX_PREFIX,
  AP_USER_LIKED_PREFIX,
  AP_ACTIVITY_PREFIX,
} from '../utils/constants.js';

import type { SocialActor as SocialActorClass } from './SocialActor.js';
import {
  SocialObjectBase,
  apLinkJoi,
  apObjectOrLinkJoi,
  apObjectOrLinkOrArrayJoi,
  apObjectJoiBuilder,
  apObjectJoi,
} from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import { socialObjectJoiProps } from './SocialObject.js';
import { apActorJoi } from './SocialActor.js';

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

  _meta?: { collection?: string[] };
};

export class SocialActivity extends SocialObjectBase<SocialActivityData> {
  static ETYPE = 'socialactivity';
  static class = 'SocialActivity';

  public static clientEnabledStaticMethods = ['getFeed'];
  protected $clientEnabledMethods = ['$send'];
  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  private $skipAcWhenSaving = false;

  public static ADDRESS = 'http://127.0.0.1:5173';
  public static apex: ReturnType<typeof ActivitypubExpress>;

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

  static async getFeed(
    feed: 'home' | 'favorites' | 'local' | 'global' | 'notifications',
    after?: string
  ) {
    const user = (this.nymph.tilmeld as Tilmeld).currentUser;

    let afterEntry =
      after && typeof after === 'string' ? await this.factoryId(after) : null;
    if (afterEntry && afterEntry.guid == null) {
      throw new HttpError("Couldn't find last activity.", 400);
    }

    if (!user) {
      throw new HttpError('You are not logged in.', 401);
    }

    if (feed === 'home') {
      const collection = `${AP_USER_INBOX_PREFIX(this.ADDRESS)}${
        user.username
      }}`;

      return await this.nymph.getEntities(
        { class: this, limit: 20, sort: 'cdate', reverse: true },
        {
          type: '&',
          contain: ['_meta', collection],
          ...(afterEntry != null && afterEntry.guid != null
            ? {
                lte: ['cdate', afterEntry.cdate || 0],
                '!guid': afterEntry.guid,
              }
            : {}),
        }
      );
    }

    if (feed === 'notifications') {
      const collection = `${AP_USER_INBOX_PREFIX(this.ADDRESS)}${
        user.username
      }}`;

      return await this.nymph.getEntities(
        { class: this, limit: 20, sort: 'cdate', reverse: true },
        {
          type: '&',
          contain: ['_meta', collection],
          ...(afterEntry != null && afterEntry.guid != null
            ? {
                lte: ['cdate', afterEntry.cdate || 0],
                '!guid': afterEntry.guid,
              }
            : {}),
        },
        {
          type: '|',
          equal: [
            ['type', 'Accept'],
            ['type', 'TentativeAccept'],
            ['type', 'Like'],
            ['type', 'Offer'],
          ],
        }
      );
    }

    if (feed === 'local') {
      const prefix = AP_USER_ID_PREFIX(this.ADDRESS);
      const SocialActor = this.nymph.getEntityClass(
        'SocialActor'
      ) as typeof SocialActorClass;

      return await this.nymph.getEntities(
        { class: this, limit: 20, sort: 'cdate', reverse: true },
        {
          type: '|',
          match: ['actor', `^${prefix}`],
          qref: [
            'actor',
            [
              { class: SocialActor },
              { type: '&', match: ['id', `^${prefix}`] },
            ],
          ],
        },
        ...(afterEntry != null && afterEntry.guid != null
          ? ([
              {
                type: '&',
                lte: ['cdate', afterEntry.cdate || 0],
                '!guid': afterEntry.guid,
              },
            ] as Selector[])
          : [])
      );
    }

    if (feed === 'global') {
      return await this.nymph.getEntities(
        { class: this, limit: 20, sort: 'cdate', reverse: true },
        ...(afterEntry != null && afterEntry.guid != null
          ? ([
              {
                type: '&',
                lte: ['cdate', afterEntry.cdate || 0],
                '!guid': afterEntry.guid,
              },
            ] as Selector[])
          : [])
      );
    }

    if (feed === 'favorites') {
      const collection = `${AP_USER_LIKED_PREFIX(this.ADDRESS)}${
        user.username
      }}`;

      return await this.nymph.getEntities(
        { class: this, limit: 20, sort: 'cdate', reverse: true },
        {
          type: '&',
          contain: ['_meta', collection],
          ...(afterEntry != null && afterEntry.guid != null
            ? {
                lte: ['cdate', afterEntry.cdate || 0],
                '!guid': afterEntry.guid,
              }
            : {}),
        }
      );
    }
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

  async $send() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to send.
      throw new HttpError('You are not logged in.', 401);
    }

    if (this.$data.id != null) {
      throw new HttpError('You can only send new things.', 400);
    }

    const user = (this.$nymph.tilmeld as Tilmeld).currentUser;
    const cookie = (this.$nymph.tilmeld as Tilmeld).request?.headers.cookie;
    const token = (this.$nymph.tilmeld as Tilmeld).request?.header(
      'X-Xsrf-Token'
    );

    if (user == null) {
      throw new HttpError('You are not logged in.', 401);
    }

    if (cookie == null) {
      throw new HttpError("Couldn't get request cookie.", 500);
    }

    if (token == null) {
      throw new HttpError("Couldn't get request cookie.", 500);
    }

    this.$data.actor = `${AP_USER_ID_PREFIX(
      (this.constructor as typeof SocialActivity).ADDRESS
    )}${user.username}`;

    if (this.$data.to == null) {
      this.$data.to = [AP_PUBLIC_ADDRESS];
    }

    if (this.$data.fullType == null) {
      this.$data.fullType = this.$data.type;
    }

    // Save the entity.
    this.$data.id = `${AP_ACTIVITY_PREFIX(
      (this.constructor as typeof SocialActivity).ADDRESS
    )}${guid()}`;
    this.$data.user = user;
    if (!(await this.$saveSkipAC())) {
      throw new HttpError("Couldn't save activity.", 500);
    }

    const outbox = `${AP_USER_OUTBOX_PREFIX(
      (this.constructor as typeof SocialActivity).ADDRESS
    )}${user.username}`;
    const apObject = await (
      this.constructor as typeof SocialActivity
    ).apex.fromJSONLD(await this.$toAPObject(false));

    const result = await fetch(outbox, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/activity+json',
        Accept: 'application/activity+json',
        Cookie: cookie,
        'X-Xsrf-Token': token,
      },
      body: JSON.stringify(apObject),
    });

    return result.ok;
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
        nymphSocialActivityJoi,
        'Invalid SocialActivity: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (JSON.stringify(this.$getValidatable()).length > 200 * 1024) {
      throw new HttpError(
        'This server has a max of 200KiB for activities.',
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

export const apActivityJoiProps = {
  actor: Joi.alternatives()
    .try(
      apLinkJoi,
      Joi.link('#Root.__ACTOR'),
      Joi.array().items(
        Joi.alternatives().try(apLinkJoi, Joi.link('#Root.__ACTOR'))
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
};

export const apActivityJoiBuilder = (
  additionalKeys: SchemaMap<any> = {},
  id: string
) =>
  apObjectJoiBuilder(
    {
      ...apActivityJoiProps,
      ...additionalKeys,
    },
    id
  );

export const apActivityJoi = apActivityJoiBuilder({}, 'APActivity');

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

export const nymphSocialActivityJoi = apActivityJoiBuilder(
  {
    ...nymphJoiProps,
    ...tilmeldJoiProps,

    ...socialObjectJoiProps,
    ...socialActivityJoiProps,

    // This is needed for "APObject" links.
    __OBJECT: apObjectJoi,

    // This is needed for "APActor" links.
    __ACTOR: apActorJoi,
  },
  'Root'
);
