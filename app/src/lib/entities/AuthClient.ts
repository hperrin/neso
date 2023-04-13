import { Entity } from '@nymphjs/client';

export type AuthClientData = {
  id: string;
  name: string;
  website?: string;
  scopes: string;
  redirectUris: string[];
  grants: string[];
  accessTokenLifetime?: number;
  refreshTokenLifetime?: number;
};

export class AuthClient extends Entity<AuthClientData> {
  // The name of the server class
  public static class = 'AuthClient';

  public $level = 0;

  constructor(guid?: string) {
    super(guid);
  }

  static async factory(guid?: string): Promise<AuthClient & AuthClientData> {
    return (await super.factory(guid)) as AuthClient & AuthClientData;
  }

  static factorySync(guid?: string): AuthClient & AuthClientData {
    return super.factorySync(guid) as AuthClient & AuthClientData;
  }
}
