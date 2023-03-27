import { Entity } from '@nymphjs/nymph';
import type { APLink } from '_activitypub';

import type {
  SocialCollection,
  SocialCollectionData,
} from './SocialCollection.js';

export type SocialObjectBaseData = {
  type:
    | 'Object'
    | 'Relationship'
    | 'Article'
    | 'Article'
    | 'Document'
    | 'Audio'
    | 'Image'
    | 'Video'
    | 'Note'
    | 'Page'
    | 'Event'
    | 'Place'
    | 'Mention'
    | 'Profile'
    | 'Tombstone';
  fullType: string[];
  id?: string;
  attachment?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  attributedTo?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  audience?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  content?: string;
  contentMap?: { [k: string]: string };
  name?: string;
  nameMap?: { [k: string]: string };
  endTime?: number;
  generator?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  icon?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData & { type: 'Image' })[];
  image?: (SocialObjectBase<SocialObjectBaseData> &
    SocialObjectBaseData & { type: 'Image' })[];
  inReplyTo?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  location?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  preview?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  published?: number;
  replies?: SocialCollection & SocialCollectionData;
  startTime?: number;
  summary?: string;
  summaryMap?: { [k: string]: string };
  tag?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  updated?: number;
  url?: string[];
  to?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  bto?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  cc?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  bcc?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  mediaType?: string;
  duration?: string;

  context?: (
    | APLink
    | (SocialObjectBase<SocialObjectBaseData> & SocialObjectBaseData)
  )[];
  source?: { content: string; mediaType: string };
  likes?: APLink | (SocialCollection & SocialCollectionData);
  shares?: APLink | (SocialCollection & SocialCollectionData);

  _meta?: { [k: string]: string };
};

export class SocialObjectBase<
  T extends Omit<SocialObjectBaseData, 'type'>
> extends Entity<T> {
  static ETYPE = 'never';
  static class = 'Never';

  async $save(): Promise<boolean> {
    throw new Error("You can't save this entity type.");
  }
}
