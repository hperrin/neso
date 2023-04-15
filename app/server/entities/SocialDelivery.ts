import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type SocialDeliveryData = {
  after: number;
  attempt: number;
  actorId: string;
  body: string;
  address: string;
  signingKey: string;
};

export class SocialDelivery extends Entity<SocialDeliveryData> {
  static ETYPE = 'socialdelivery';
  static class = 'SocialDelivery';

  static searchRestrictedData = [
    'after',
    'attempt',
    'actorId',
    'body',
    'address',
    'signingKey',
  ];

  protected $privateData = [
    'after',
    'attempt',
    'actorId',
    'body',
    'address',
    'signingKey',
  ];
  protected $allowlistData = [];
  protected $allowlistTags = [];

  private $skipAcWhenSaving = false;
  private $skipAcWhenDeleting = false;

  static async factory(
    guid?: string
  ): Promise<SocialDelivery & SocialDeliveryData> {
    return (await super.factory(guid)) as SocialDelivery & SocialDeliveryData;
  }

  static factorySync(guid?: string): SocialDelivery & SocialDeliveryData {
    return super.factorySync(guid) as SocialDelivery & SocialDeliveryData;
  }

  constructor(guid?: string) {
    super(guid);
  }

  async $save() {
    if (!this.$skipAcWhenSaving) {
      throw new HttpError('Only allowed by the server.', 403);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,

          after: Joi.number().required(),
          attempt: Joi.number().required(),
          actorId: Joi.string().required(),
          body: Joi.string().required(),
          address: Joi.string().required(),
          signingKey: Joi.string().required(),
        }),
        'Invalid SocialDelivery: '
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
