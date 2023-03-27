import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

import { SocialCollection } from './SocialCollection.js';
import { SocialObjectBase } from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';

export type SocialObjectData = SocialObjectBaseData;

export class SocialObject extends SocialObjectBase<SocialObjectData> {
  static ETYPE = 'socialobject';
  static class = 'SocialObject';

  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  static async factory(
    guid?: string
  ): Promise<SocialObject & SocialObjectData> {
    return (await super.factory(guid)) as SocialObject & SocialObjectData;
  }

  static factorySync(guid?: string): SocialObject & SocialObjectData {
    return super.factorySync(guid) as SocialObject & SocialObjectData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.type = 'Object';
      this.$data.fullType = ['Object'];
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
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
        Joi.object({
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
}

export const socialLinkJoi = Joi.alternatives().try(
  Joi.string().uri(),
  Joi.object().keys({
    type: Joi.any().valid('Link', 'Mention').required(),
    fullType: Joi.array().items(Joi.string().max(512).trim(false)).required(),
    href: Joi.string().uri().required(),
    rel: Joi.array().items(Joi.string().max(64).trim(false)),
    mediaType: Joi.array().items(Joi.string().max(96).trim(false)),
    name: Joi.string().max(240),
    nameMap: Joi.object().pattern(/.*/, Joi.string().max(240)),
    hreflang: Joi.string().max(128),
    height: Joi.number(),
    width: Joi.number(),
    preview: Joi.array().items(Joi.object().instance(SocialObject)),
    attributedTo: Joi.array().items(Joi.object().instance(SocialObject)),
  })
);

export const socialObjectOrLink = Joi.alternatives(
  Joi.object().instance(SocialObject),
  socialLinkJoi
);

export const socialObjectJoiProps = {
  type: Joi.any()
    .valid(
      'Object',
      'Relationship',
      'Article',
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
  fullType: Joi.array().items(Joi.string().max(512).trim(false)).required(),
  id: Joi.string().max(2048).trim(false).uri(),

  attachment: Joi.array().items(socialObjectOrLink),
  attributedTo: Joi.array().items(socialObjectOrLink),
  audience: Joi.array().items(socialObjectOrLink),
  content: Joi.string().max(5000),
  contentMap: Joi.object().pattern(/.*/, Joi.string().max(5000)),
  name: Joi.string().max(240),
  nameMap: Joi.object().pattern(/.*/, Joi.string().max(240)),
  endTime: Joi.number(),
  generator: Joi.array().items(socialObjectOrLink),
  icon: Joi.array().items(socialObjectOrLink),
  image: Joi.array().items(socialObjectOrLink),
  inReplyTo: Joi.array().items(socialObjectOrLink),
  location: Joi.array().items(socialObjectOrLink),
  preview: Joi.array().items(socialObjectOrLink),
  published: Joi.number(),
  replies: Joi.object().instance(SocialCollection),
  startTime: Joi.number(),
  summary: Joi.string().max(2000),
  summaryMap: Joi.object().pattern(/.*/, Joi.string().max(2000)),
  tag: Joi.array().items(socialObjectOrLink),
  updated: Joi.number(),
  url: Joi.array().items(Joi.string().uri()),
  to: Joi.array().items(socialObjectOrLink),
  bto: Joi.array().items(socialObjectOrLink),
  cc: Joi.array().items(socialObjectOrLink),
  bcc: Joi.array().items(socialObjectOrLink),
  mediaType: Joi.string().max(64).trim(false),
  duration: Joi.string().max(64).trim(false),

  context: Joi.array().items(socialObjectOrLink),
  source: Joi.object().keys({
    content: Joi.string().max(5000).required(),
    mediaType: Joi.string().max(64).trim(false).required(),
  }),
  likes: Joi.object().instance(SocialCollection),
  shares: Joi.object().instance(SocialCollection),

  _meta: Joi.object(),
};
