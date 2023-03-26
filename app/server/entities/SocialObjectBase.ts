import { Entity } from '@nymphjs/nymph';

import type {
  SocialCollection,
  SocialCollectionData,
} from './SocialCollection.js';

export type SocialObjectBaseData = {
  type: 'Object' | string;
  fullType: string[];
  id?: string;
  attachment?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData)[];
  attributedTo?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData)[];
  audience?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  content?: string;
  contentMap?: { [k: string]: string };
  name?: string;
  nameMap?: { [k: string]: string };
  endTime?: number;
  generator?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  icon?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData & { type: 'Image' })[];
  image?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData & { type: 'Image' })[];
  inReplyTo?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  location?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  preview?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  published?: number;
  replies?: SocialCollection & SocialCollectionData;
  startTime?: number;
  summary?: string;
  summaryMap?: { [k: string]: string };
  tag?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  updated?: number;
  url?: string[];
  to?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  bto?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  cc?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  bcc?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  mediaType?: string;
  duration?: string;

  context?: (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)[];
  source?: SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData;
  likes?: SocialCollection & SocialCollectionData;
  shares?: SocialCollection & SocialCollectionData;
};

export class SocialObjectBase<
  T extends SocialObjectBaseData
> extends Entity<T> {
  static ETYPE = 'never';
  static class = 'Never';

  async $save(): Promise<boolean> {
    throw new Error("You can't save this entity type.");
  }
}
