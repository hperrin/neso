import type { EntityJson, Selector } from '@nymphjs/nymph';
import { nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import { Tilmeld, tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import fetch from 'node-fetch';
import type { APObject } from '_activitypub';
import ActivitypubExpress from 'activitypub-express';

import {
  AP_PUBLIC_ADDRESS,
  AP_USER_ID_PREFIX,
  AP_USER_OUTBOX_PREFIX,
} from '../utils/constants.js';

import {
  SocialObjectBase,
  apObjectJoiBuilder,
  apObjectJoi,
} from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import type { SocialActivity as SocialActivityClass } from './SocialActivity.js';

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

export class SocialObject extends SocialObjectBase<SocialObjectData> {
  static ETYPE = 'socialobject';
  static class = 'SocialObject';

  protected $clientEnabledMethods = ['$getActivity', '$send'];
  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  private $skipAcWhenSaving = false;
  private $skipAcWhenDeleting = false;

  public static ADDRESS = 'http://127.0.0.1:5173';
  public static apex: ReturnType<typeof ActivitypubExpress>;

  $liked: string | false = false;
  $boosted: string | false = false;

  static async factory(
    guid?: string
  ): Promise<SocialObject & SocialObjectData> {
    const SocialActivity = this.nymph.getEntityClass(
      'SocialActivity'
    ) as typeof SocialActivityClass;
    const entity = (await super.factory(guid)) as SocialObject &
      SocialObjectData;

    if (entity.guid) {
      const activity = await entity.$getActivity();
      entity.$liked =
        (
          await this.nymph.getEntity(
            { class: SocialActivity },
            { type: '&', equal: ['type', 'Like'] },
            {
              type: '|',
              equal: ['object', activity],
              contain: ['object', activity],
              qref: [
                'object',
                [
                  { class: this.constructor as typeof SocialObject },
                  { type: '&', equal: ['id', activity] },
                ],
              ],
            }
          )
        )?.id || false;
      entity.$boosted =
        (
          await this.nymph.getEntity(
            { class: SocialActivity },
            { type: '&', equal: ['type', 'Announce'] },
            {
              type: '|',
              equal: ['object', activity],
              contain: ['object', activity],
              qref: [
                'object',
                [
                  { class: this.constructor as typeof SocialObject },
                  { type: '&', equal: ['id', activity] },
                ],
              ],
            }
          )
        )?.id || false;
    }

    return entity;
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
        const SocialActivity = this.nymph.getEntityClass(
          'SocialActivity'
        ) as typeof SocialActivityClass;

        const activity = await entity.$getActivity();
        entity.$liked =
          (
            await this.nymph.getEntity(
              { class: SocialActivity },
              { type: '&', equal: ['type', 'Like'] },
              {
                type: '|',
                equal: ['object', activity],
                contain: ['object', activity],
                qref: [
                  'object',
                  [
                    { class: this.constructor as typeof SocialObject },
                    { type: '&', equal: ['id', activity] },
                  ],
                ],
              }
            )
          )?.id || false;
        entity.$boosted =
          (
            await this.nymph.getEntity(
              { class: SocialActivity },
              { type: '&', equal: ['type', 'Announce'] },
              {
                type: '|',
                equal: ['object', activity],
                contain: ['object', activity],
                qref: [
                  'object',
                  [
                    { class: this.constructor as typeof SocialObject },
                    { type: '&', equal: ['id', activity] },
                  ],
                ],
              }
            )
          )?.id || false;

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

  public toJSON() {
    const obj = super.toJSON();

    if (obj && !Array.isArray(obj)) {
      (obj as EntityJson & { $liked: string | false }).$liked = this.$liked;
      (obj as EntityJson & { $boosted: string | false }).$boosted =
        this.$boosted;
    }

    return obj;
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
          entry === 'Tombstone' ||
          entry === 'Collection' ||
          entry === 'OrderedCollection' ||
          entry === 'CollectionPage' ||
          entry === 'OrderedCollectionPage'
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
      obj.type === 'Tombstone' ||
      obj.type === 'Collection' ||
      obj.type === 'OrderedCollection' ||
      obj.type === 'CollectionPage' ||
      obj.type === 'OrderedCollectionPage'
    ) {
      this.$data.type = obj.type;
    }
    this.$data.fullType = obj.type;
  }

  async $getActivity() {
    const SocialActivity = this.$nymph.getEntityClass(
      'SocialActivity'
    ) as typeof SocialActivityClass;
    return (
      await this.$nymph.getEntity(
        { class: SocialActivity },
        { type: '&', equal: ['type', 'Create'] },
        {
          type: '|',
          equal: ['object', this.$data.id],
          contain: ['object', this.$data.id],
          qref: [
            'object',
            [
              { class: this.constructor as typeof SocialObject },
              { type: '&', equal: ['id', this.$data.id] },
            ],
          ],
        }
      )
    )?.id;
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

    this.$data.attributedTo = `${AP_USER_ID_PREFIX(
      (this.constructor as typeof SocialObject).ADDRESS
    )}${user.username}`;

    if (this.$data.to == null) {
      this.$data.to = [AP_PUBLIC_ADDRESS];
    }

    if (this.$data.fullType == null) {
      this.$data.fullType = this.$data.type;
    }

    const outbox = `${AP_USER_OUTBOX_PREFIX(
      (this.constructor as typeof SocialObject).ADDRESS
    )}${user.username}`;
    const apObject = await (
      this.constructor as typeof SocialObject
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

    if (
      !this.$skipAcWhenSaving &&
      (this.$data.type === 'Collection' ||
        this.$data.type === 'OrderedCollection' ||
        this.$data.type === 'CollectionPage' ||
        this.$data.type === 'OrderedCollectionPage')
    ) {
      throw new HttpError('Only the server can do that.', 403);
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
        nymphSocialObjectJoi,
        'Invalid SocialObject: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (JSON.stringify(this.$getValidatable()).length > 200 * 1024) {
      throw new HttpError('This server has a max of 200KiB for objects.', 413);
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
      'Tombstone',

      'Collection',
      'OrderedCollection',
      'CollectionPage',
      'OrderedCollectionPage'
    )
    .required(),
  fullType: Joi.alternatives()
    .try(Joi.string().trim(false), Joi.array().items(Joi.string().trim(false)))
    .required(),

  endTime: Joi.number(),
  published: Joi.number(),
  startTime: Joi.number(),
  updated: Joi.number(),

  _meta: Joi.object(),
};

export const nymphSocialObjectJoi = apObjectJoiBuilder(
  {
    ...nymphJoiProps,
    ...tilmeldJoiProps,

    ...socialObjectJoiProps,

    // This is needed for "APObject" links.
    __OBJECT: apObjectJoi,
  },
  'Root'
);
