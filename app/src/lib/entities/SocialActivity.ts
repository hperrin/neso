import { Entity } from '@nymphjs/client';
import type { APLink, APActor, APObject } from '_activitypub';

import type { SocialObjectBaseData } from './SocialObjectBase.js';

export type SocialActivityData = SocialObjectBaseData & {
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
  actor: APLink | APActor | (APLink | APActor)[];
  object?: APLink | APObject | (APLink | APObject)[];
  target?: APLink | APObject | (APLink | APObject)[];
  result?: APLink | APObject | (APLink | APObject)[];
  origin?: APLink | APObject | (APLink | APObject)[];
  instrument?: APLink | APObject | (APLink | APObject)[];

  anyOf?: APLink | APObject | (APLink | APObject)[];
  oneOf?: APLink | APObject | (APLink | APObject)[];
  closed?:
    | APObject
    | APLink
    | string
    | boolean
    | (APObject | APLink | string | boolean)[];
};

export class SocialActivity extends Entity<SocialActivityData> {
  // The name of the server class
  public static class = 'SocialActivity';

  public $level = 0;

  constructor(guid?: string) {
    super(guid);
  }

  static async factory(
    guid?: string
  ): Promise<SocialActivity & SocialActivityData> {
    return (await super.factory(guid)) as SocialActivity & SocialActivityData;
  }

  static factorySync(guid?: string): SocialActivity & SocialActivityData {
    return super.factorySync(guid) as SocialActivity & SocialActivityData;
  }

  static async factoryId(
    id?: string
  ): Promise<SocialActivity & SocialActivityData> {
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

  async $send() {
    return await this.$serverCall('$send', [], true);
  }
}
