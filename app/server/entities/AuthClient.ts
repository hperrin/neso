import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type AuthClientData = {
  id: string;
  secret: string;
  name: string;
  website?: string;
  scopes: string;
  redirectUris: string[];
  grants: string[];
  accessTokenLifetime?: number;
  refreshTokenLifetime?: number;
};

export class AuthClient extends Entity<AuthClientData> {
  static ETYPE = 'authclient';
  static class = 'AuthClient';

  protected $allowlistData = [];
  protected $allowlistTags = [];
  protected $privateData = ['secret'];

  private $skipAcWhenSaving = false;

  static async factory(guid?: string): Promise<AuthClient & AuthClientData> {
    return (await super.factory(guid)) as AuthClient & AuthClientData;
  }

  static factorySync(guid?: string): AuthClient & AuthClientData {
    return super.factorySync(guid) as AuthClient & AuthClientData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.scopes = 'read';
      this.$data.grants = [
        'authorization_code',
        'refresh_token',
        'password',
        'implicit',
        // 'client_credentials', // <-- See https://oauth2-server.readthedocs.io/en/latest/model/overview.html#client-credentials-grant
      ];
    }
  }

  async $save() {
    if (!this.$skipAcWhenSaving) {
      throw new HttpError('This should only be created by the backend.', 403);
    }

    if (this.$data.website && this.$data.website.startsWith('javascript')) {
      throw new HttpError('Bad website.', 400);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,

          id: Joi.string().required(),
          secret: Joi.string().required(),
          name: Joi.string().required(),
          website: Joi.string().uri(),
          scopes: Joi.string(),
          redirectUris: Joi.array().items(Joi.string().uri()),
          grants: Joi.array().items(Joi.string()).required(),
          accessTokenLifetime: Joi.number(),
          refreshTokenLifetime: Joi.number(),
        }),
        'Invalid AuthClient: '
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
