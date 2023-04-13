import { Entity, nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import type { AccessControlData } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

import { AuthClient } from './AuthClient.js';
import type { AuthClientData } from './AuthClient.js';

export type AuthCodeData = {
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  scope?: string;
  client: AuthClient & AuthClientData;
} & AccessControlData;

export class AuthCode extends Entity<AuthCodeData> {
  static ETYPE = 'authcode';
  static class = 'AuthCode';

  protected $allowlistData = [];
  protected $allowlistTags = ['revoked'];

  private $skipAcWhenSaving = false;

  static async factory(guid?: string): Promise<AuthCode & AuthCodeData> {
    return (await super.factory(guid)) as AuthCode & AuthCodeData;
  }

  static factorySync(guid?: string): AuthCode & AuthCodeData {
    return super.factorySync(guid) as AuthCode & AuthCodeData;
  }

  get expiresAt() {
    return new Date(this.$data.expiresAt);
  }
  set expiresAt(value: Date) {
    // @ts-ignore
    this.$data.expiresAt = value.getTime();
  }

  constructor(guid?: string) {
    super(guid);
  }

  async $save() {
    if (!this.$skipAcWhenSaving) {
      throw new HttpError('This should only be created by the backend.', 403);
    }

    if (this.$data.user == null) {
      throw new HttpError('Need a user.', 400);
    }
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
      this.$data.acOther = TilmeldAccessLevels.NO_ACCESS;
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

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          authorizationCode: Joi.string().trim().max(512).required(),
          expiresAt: Joi.number().required(),
          redirectUri: Joi.string().trim().uri().required(),
          scope: Joi.string().trim().max(128),
          client: Joi.object().instance(AuthClient),
        }),
        'Invalid AuthCode: '
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
}
