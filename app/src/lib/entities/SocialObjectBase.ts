import type { AccessControlData } from '@nymphjs/tilmeld';
import type { APLink, APObject, APCollection } from '_activitypub';

export type SocialObjectBaseData = {
  [k: string]: any;

  fullType: string | string[];
  id?: string;
  attachment?: APLink | APObject | (APLink | APObject)[];
  attributedTo?: APLink | APObject | (APLink | APObject)[];
  audience?: APLink | APObject | (APLink | APObject)[];
  content?: string;
  contentMap?: { [k: string]: string };
  name?: string;
  nameMap?: { [k: string]: string };
  endTime?: number;
  generator?: APLink | APObject | (APLink | APObject)[];
  icon?:
    | APLink
    | (APObject & { type: 'Image' })
    | (APLink | (APObject & { type: 'Image' }))[];
  image?:
    | APLink
    | (APObject & { type: 'Image' })
    | (APLink | (APObject & { type: 'Image' }))[];
  inReplyTo?: APLink | APObject | (APLink | APObject)[];
  location?: APLink | APObject | (APLink | APObject)[];
  preview?: APLink | APObject | (APLink | APObject)[];
  published?: number;
  replies?: APLink | APCollection;
  startTime?: number;
  summary?: string;
  summaryMap?: { [k: string]: string };
  tag?: APLink | APObject | (APLink | APObject)[];
  updated?: number;
  url?: string[];
  to?: APLink | APObject | (APLink | APObject)[];
  bto?: APLink | APObject | (APLink | APObject)[];
  cc?: APLink | APObject | (APLink | APObject)[];
  bcc?: APLink | APObject | (APLink | APObject)[];
  mediaType?: string;
  duration?: string;

  context?: APLink | APObject | (APLink | APObject)[];
  source?: { content: string; mediaType: string };
  likes?: APLink | APCollection;
  shares?: APLink | APCollection;
} & AccessControlData;
