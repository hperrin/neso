import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import type { PublicKey, Endpoints } from '_activitypub';

import { SocialObjectBase } from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import { socialObjectJoiProps } from './SocialObject.js';

export type SocialActorData = Omit<SocialObjectBaseData, 'type'> & {
  type: 'Application' | 'Group' | 'Organization' | 'Person' | 'Service';
  inbox: string;
  outbox: string;
  following?: string;
  followers?: string;
  liked?: string;
  name?: string;
  preferredUsername?: string;
  summary?: string;
  streams?: string[];
  endpoints?: Endpoints | string;
  publicKey?: PublicKey;
};

export class SocialActor extends SocialObjectBase<SocialActorData> {
  static ETYPE = 'socialactor';
  static class = 'SocialActor';

  protected $privateData = ['_meta'];
  protected $protectedData = ['id'];

  static async factory(guid?: string): Promise<SocialActor & SocialActorData> {
    return (await super.factory(guid)) as SocialActor & SocialActorData;
  }

  static factorySync(guid?: string): SocialActor & SocialActorData {
    return super.factorySync(guid) as SocialActor & SocialActorData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.type = 'Person';
      this.$data.fullType = ['Person'];
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Check that this actor doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialActor,
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
      throw new HttpError('That actor already exists.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          ...socialObjectJoiProps,
          ...socialActorJoiProps,
        }),
        'Invalid SocialActor: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (JSON.stringify(this.$getValidatable()).length > 50 * 1024) {
      throw new HttpError('This server has a max of 50KiB for actors.', 413);
    }

    return await super.$save();
  }
}

export const socialActorEndpointsJoi = Joi.object().keys({
  proxyUrl: Joi.string().uri(),
  oauthAuthorizationEndpoint: Joi.string().uri(),
  oauthTokenEndpoint: Joi.string().uri(),
  provideClientKey: Joi.string().uri(),
  signClientKey: Joi.string().uri(),
  sharedInbox: Joi.string().uri(),
});

export const socialActorPublicKeyJoi = Joi.object().keys({
  id: Joi.string().uri(),
  owner: Joi.string().uri(),
  publicKeyPem: Joi.string().max(8192),
});

export const socialActorJoiProps = {
  type: Joi.any()
    .valid('Application', 'Group', 'Organization', 'Person', 'Service')
    .required(),
  inbox: Joi.string().uri().required(),
  outbox: Joi.string().uri().required(),
  following: Joi.string().uri(),
  followers: Joi.string().uri(),
  liked: Joi.string().uri(),
  name: Joi.string().max(240),
  preferredUsername: Joi.string().max(128).trim(false),
  summary: Joi.string().max(5000),
  streams: Joi.array().items(Joi.string().uri()),
  endpoints: socialActorEndpointsJoi,
  publicKey: socialActorPublicKeyJoi,
};
