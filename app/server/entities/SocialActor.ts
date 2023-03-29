import type { Selector } from '@nymphjs/nymph';
import { nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import type { SchemaMap } from 'joi';
import type { PublicKey, Endpoints, APActor } from '_activitypub';

import { SocialObjectBase, apObjectJoiBuilder } from './SocialObjectBase.js';
import type { SocialObjectBaseData } from './SocialObjectBase.js';
import { socialObjectJoiProps } from './SocialObject.js';

export type SocialActorData = SocialObjectBaseData & {
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

  static async factoryId(id?: string): Promise<SocialActor & SocialActorData> {
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
      this.$data.type = 'Person';
      this.$data.fullType = ['Person'];
    }
  }

  async $acceptAPObject(obj: APActor, fullReplace: boolean) {
    super.$acceptAPObject(obj, fullReplace);

    if (Array.isArray(obj.type)) {
      for (const entry of obj.type) {
        if (
          entry === 'Application' ||
          entry === 'Group' ||
          entry === 'Organization' ||
          entry === 'Person' ||
          entry === 'Service'
        ) {
          this.$data.type = entry;
          break;
        }
      }
    } else if (
      obj.type === 'Application' ||
      obj.type === 'Group' ||
      obj.type === 'Organization' ||
      obj.type === 'Person' ||
      obj.type === 'Service'
    ) {
      this.$data.type = obj.type;
    }
    this.$data.fullType = obj.type;
  }

  async $toAPObject(includeMeta: boolean): Promise<APActor> {
    const obj = {
      ...(await super.$toAPObject(includeMeta)),
      inbox: this.$data.inbox,
      outbox: this.$data.outbox,
    } as APActor;

    return obj;
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
        apActorJoiBuilder({
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

export const apActorEndpointsJoi = Joi.object().keys({
  proxyUrl: Joi.string().uri(),
  oauthAuthorizationEndpoint: Joi.string().uri(),
  oauthTokenEndpoint: Joi.string().uri(),
  provideClientKey: Joi.string().uri(),
  signClientKey: Joi.string().uri(),
  sharedInbox: Joi.string().uri(),
});

export const apActorPublicKeyJoi = Joi.object().keys({
  id: Joi.string().uri(),
  owner: Joi.string().uri(),
  publicKeyPem: Joi.string().max(8192),
});

export const apActorJoiBuilder = (additionalKeys: SchemaMap<any> = {}) =>
  apObjectJoiBuilder({
    inbox: Joi.string().uri().required(),
    outbox: Joi.string().uri().required(),
    following: Joi.string().uri(),
    followers: Joi.string().uri(),
    liked: Joi.string().uri(),
    name: Joi.string().max(240),
    preferredUsername: Joi.string().max(128).trim(false),
    summary: Joi.string().max(5000),
    streams: Joi.array().items(Joi.string().uri()),
    endpoints: apActorEndpointsJoi,
    publicKey: apActorPublicKeyJoi,

    ...additionalKeys,
  });

export const socialActorJoiProps = {
  type: Joi.any()
    .valid('Application', 'Group', 'Organization', 'Person', 'Service')
    .required(),
};
