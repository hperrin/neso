import { Entity, nymphJoiProps, TilmeldAccessLevels } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import type { AccessControlData } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

import { AuthClient } from './AuthClient.js';
import type { AuthClientData } from './AuthClient.js';

export type AuthTokenData = {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  client: AuthClient & AuthClientData;
} & AccessControlData;

export class AuthToken extends Entity<AuthTokenData> {
  static ETYPE = 'authtoken';
  static class = 'AuthToken';

  protected $allowlistData = [];
  protected $allowlistTags = [];

  private $skipAcWhenSaving = false;
  private $skipAcWhenDeleting = false;

  static async factory(guid?: string): Promise<AuthToken & AuthTokenData> {
    return (await super.factory(guid)) as AuthToken & AuthTokenData;
  }

  static factorySync(guid?: string): AuthToken & AuthTokenData {
    return super.factorySync(guid) as AuthToken & AuthTokenData;
  }

  get accessTokenExpiresAt() {
    if (this.$data.accessTokenExpiresAt == null) {
      // @ts-ignore
      return this.$data.accessTokenExpiresAt;
    }
    return new Date(this.$data.accessTokenExpiresAt);
  }
  set accessTokenExpiresAt(value: Date) {
    // @ts-ignore
    this.$data.accessTokenExpiresAt = value.getTime();
  }

  get refreshTokenExpiresAt() {
    if (this.$data.refreshTokenExpiresAt == null) {
      // @ts-ignore
      return this.$data.refreshTokenExpiresAt;
    }
    return new Date(this.$data.refreshTokenExpiresAt);
  }
  set refreshTokenExpiresAt(value: Date) {
    // @ts-ignore
    this.$data.refreshTokenExpiresAt = value.getTime();
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
        Joi.object()
          .keys({
            ...nymphJoiProps,
            ...tilmeldJoiProps,

            accessToken: Joi.string().trim().max(512),
            accessTokenExpiresAt: Joi.number(),
            refreshToken: Joi.string().trim().max(512),
            refreshTokenExpiresAt: Joi.number(),
            scope: Joi.string().trim().max(128),
            client: Joi.object().instance(AuthClient),
          })
          .with('accessToken', 'accessTokenExpiresAt')
          .with('refreshToken', 'refreshTokenExpiresAt')
          .xor('accessToken', 'refreshToken'),
        'Invalid AuthToken: '
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
