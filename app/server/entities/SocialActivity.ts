import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import type { APLink } from '_activitypub';

import { SocialObjectBase } from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import { socialObjectJoiProps, socialObjectOrLink } from './SocialObject.js';
import { SocialActor } from './SocialActor.js';
import type { SocialActorData } from './SocialActor.js';

export type SocialActivityData = Omit<SocialObjectBaseData, 'type'> & {
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
  actor: SocialActor & SocialActorData;
  object?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  target?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  result?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  origin?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  instrument?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];

  anyOf?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  oneOf?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  closed?:
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
    | APLink
    | string
    | boolean
    | (
        | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
        | APLink
        | string
        | boolean
      )[];
};

export class SocialActivity extends SocialObjectBase<SocialActivityData> {
  static ETYPE = 'socialactivity';
  static class = 'SocialActivity';

  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  static async factory(
    guid?: string
  ): Promise<SocialActivity & SocialActivityData> {
    return (await super.factory(guid)) as SocialActivity & SocialActivityData;
  }

  static factorySync(guid?: string): SocialActivity & SocialActivityData {
    return super.factorySync(guid) as SocialActivity & SocialActivityData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.type = 'Create';
      this.$data.fullType = ['Create'];
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
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
        Joi.object().keys({
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

    return await super.$save();
  }
}

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
  actor: Joi.object().instance(SocialActor).required(),
  object: Joi.array().items(socialObjectOrLink),
  target: Joi.array().items(socialObjectOrLink),
  result: Joi.array().items(socialObjectOrLink),
  origin: Joi.array().items(socialObjectOrLink),
  instrument: Joi.array().items(socialObjectOrLink),

  anyOf: Joi.array().items(socialObjectOrLink),
  oneOf: Joi.array().items(socialObjectOrLink),
  closed: Joi.alternatives().try(
    socialObjectOrLink,
    Joi.string().uri(),
    Joi.boolean(),
    Joi.array().items(
      Joi.alternatives().try(
        socialObjectOrLink,
        Joi.string().uri(),
        Joi.boolean()
      )
    )
  ),
};
