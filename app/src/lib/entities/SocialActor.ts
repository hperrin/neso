import { Entity } from '@nymphjs/client';
import type { PublicKey, Endpoints } from '_activitypub';

import type { SocialObjectBaseData } from './SocialObjectBase.js';

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

export class SocialActor extends Entity<SocialActorData> {
  // The name of the server class
  public static class = 'SocialActor';

  public $level = 0;

  constructor(guid?: string) {
    super(guid);
  }

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

  static async fingerUser(alias: string): Promise<string | null> {
    return await this.serverCallStatic('fingerUser', [alias]);
  }
}
