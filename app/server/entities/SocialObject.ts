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

  protected $allowlistData = ['text', 'done', 'project'];
  protected $allowlistTags = [];

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

export const socialObjectJoiProps = {
  type: Joi.string().max(512).trim(false).required(),
  fullType: Joi.array().items(Joi.string().max(512).trim(false)).required(),
  id: Joi.string().max(2048).trim(false).uri(),

  attachment: Joi.array().items(Joi.object().instance(SocialObject)),
  attributedTo: Joi.array().items(Joi.object().instance(SocialObject)),
  audience: Joi.array().items(Joi.object().instance(SocialObject)),
  content: Joi.string().max(5000),
  contentMap: Joi.object().pattern(/.*/, Joi.string().max(5000)),
  name: Joi.string().max(240),
  nameMap: Joi.object().pattern(/.*/, Joi.string().max(240)),
  endTime: Joi.number(),
  generator: Joi.array().items(Joi.object().instance(SocialObject)),
  icon: Joi.array().items(Joi.object().instance(SocialObject)),
  image: Joi.array().items(Joi.object().instance(SocialObject)),
  inReplyTo: Joi.array().items(Joi.object().instance(SocialObject)),
  location: Joi.array().items(Joi.object().instance(SocialObject)),
  preview: Joi.array().items(Joi.object().instance(SocialObject)),
  published: Joi.number(),
  replies: Joi.object().instance(SocialCollection),
  startTime: Joi.number(),
  summary: Joi.string().max(2000),
  summaryMap: Joi.object().pattern(/.*/, Joi.string().max(2000)),
  tag: Joi.array().items(Joi.object().instance(SocialObject)),
  updated: Joi.number(),
  url: Joi.array().items(Joi.string().uri()),
  to: Joi.array().items(Joi.object().instance(SocialObject)),
  bto: Joi.array().items(Joi.object().instance(SocialObject)),
  cc: Joi.array().items(Joi.object().instance(SocialObject)),
  bcc: Joi.array().items(Joi.object().instance(SocialObject)),
  mediaType: Joi.string().max(64).trim(false),
  duration: Joi.string().max(64).trim(false),

  context: Joi.array().items(Joi.object().instance(SocialObject)),
  source: Joi.object().instance(SocialObject),
  likes: Joi.object().instance(SocialCollection),
  shares: Joi.object().instance(SocialCollection),
};
