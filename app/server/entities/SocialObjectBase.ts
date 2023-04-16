import { Entity } from '@nymphjs/nymph';
import type { AccessControlData } from '@nymphjs/tilmeld';
import Joi from 'joi';
import type { SchemaMap } from 'joi';
import { APLink, APObject, APCollection } from '_activitypub';

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

export class SocialObjectBase<
  T extends SocialObjectBaseData
> extends Entity<T> {
  static ETYPE = 'never';
  static class = 'Never';

  async $acceptAPObject(obj: APObject, fullReplace: boolean) {
    // Validate the object first.
    Joi.attempt(obj, apObjectJoiBuilder(), 'Invalid APObject: ');

    if (fullReplace) {
      for (const name in this.$data) {
        if (
          [
            'id',
            'user',
            'group',
            'acUser',
            'acGroup',
            'acOther',
            'acRead',
            'acWrite',
            'acFull',
          ].indexOf(name) !== -1
        ) {
          continue;
        }

        delete this.$data[name];
      }
    }

    for (const name in obj) {
      if (name === 'id' && this.$data.id != null && obj.id !== this.$data.id) {
        throw new Error("Tried to change object ID. That's not allowed.");
      }

      switch (name) {
        // Tilmeld properties
        case 'user':
        case 'group':
        case 'acUser':
        case 'acGroup':
        case 'acOther':
        case 'acRead':
        case 'acWrite':
        case 'acFull':
          (this.$data as SocialObjectBaseData)[`_${name}`] = obj[name];
          break;
        // Dates
        case 'endTime':
        case 'published':
        case 'startTime':
        case 'updated':
          this.$data[name] = new Date(`${obj[name]}`).getTime();
          break;
        // Everything else
        default:
          (this.$data as SocialObjectBaseData)[name] = obj[name];
          break;
      }
    }
  }

  async $convertToAPObject(object: any) {
    if ('$toAPObject' in object) {
      return object.$toAPObject();
    } else if (Array.isArray(object)) {
      return object.map(this.$convertToAPObject.bind(this));
    } else {
      return object;
    }
  }

  async $toAPObject(includeMeta: boolean) {
    const obj = {
      id: this.$data.id,
      type: this.$data.fullType,
    } as APObject;

    for (const name in this.$data) {
      switch (name) {
        // Already handled
        case 'id':
        case 'type':
        case 'fullType':
          break;
        // Tilmeld properties
        case 'user':
        case 'group':
        case 'acUser':
        case 'acGroup':
        case 'acOther':
        case 'acRead':
        case 'acWrite':
        case 'acFull':
          break;
        case '_user':
        case '_group':
        case '_acUser':
        case '_acGroup':
        case '_acOther':
        case '_acRead':
        case '_acWrite':
        case '_acFull':
          obj[name.substring(1)] = this.$data[name];
          break;
        // Dates
        case 'endTime':
        case 'published':
        case 'startTime':
        case 'updated':
          obj[name] = new Date(parseInt(`${this.$data[name]}`)).toISOString();
          break;
        // Private data
        case '_meta':
          if (includeMeta && this.$data._meta != null) {
            obj._meta = this.$data._meta;
          }
          break;
        // Everything else
        default:
          obj[name] = this.$convertToAPObject(this.$data[name]);
          break;
      }
    }

    return obj;
  }

  async $save(): Promise<boolean> {
    throw new Error("You can't save this entity type.");
  }
}

export const apLinkJoi = Joi.alternatives().try(
  Joi.string().uri(),
  Joi.object().keys({
    type: Joi.any().valid('Link', 'Mention').required(),
    fullType: Joi.array().items(Joi.string().max(512).trim(false)).required(),
    href: Joi.string().uri().required(),
    rel: Joi.array().items(Joi.string().max(64).trim(false)),
    mediaType: Joi.array().items(Joi.string().max(96).trim(false)),
    name: Joi.string().max(240),
    nameMap: Joi.object().pattern(/.*/, Joi.string().max(240)),
    hreflang: Joi.string().max(128),
    height: Joi.number(),
    width: Joi.number(),
    preview: Joi.link('#APObjectOrAPLinkOrArray'),
    attributedTo: Joi.link('#APObjectOrAPLinkOrArray'),
  })
);

export const apObjectOrLinkJoi = Joi.alternatives().try(
  Joi.link('#APObject'),
  apLinkJoi
);

export const apObjectOrLinkOrArrayJoi = Joi.alternatives()
  .try(apObjectOrLinkJoi, Joi.array().items(apObjectOrLinkJoi))
  .id('APObjectOrAPLinkOrArray');

export const apCollectionPageJoi = Joi.object({
  type: Joi.any().valid('CollectionPage', 'OrderedCollectionPage').required(),
  partOf: Joi.alternatives().try(Joi.link('#APCollection'), apLinkJoi),
  next: Joi.alternatives().try(Joi.link('#APCollectionPage'), apLinkJoi),
  prev: Joi.alternatives().try(Joi.link('#APCollectionPage'), apLinkJoi),
  items: apObjectOrLinkOrArrayJoi,
  orderedItems: apObjectOrLinkOrArrayJoi,
}).id('APCollectionPage');

export const apCollectionJoi = Joi.object({
  type: Joi.any().valid('Collection', 'OrderedCollection').required(),
  totalItems: Joi.number(),
  current: Joi.alternatives().try(apCollectionPageJoi, apLinkJoi),
  first: Joi.alternatives().try(apCollectionPageJoi, apLinkJoi),
  last: Joi.alternatives().try(apCollectionPageJoi, apLinkJoi),
  items: apObjectOrLinkOrArrayJoi,
  orderedItems: apObjectOrLinkOrArrayJoi,
}).id('APCollection');

export const apCollectionOrLinkJoi = Joi.alternatives().try(
  apCollectionJoi,
  apLinkJoi
);

export const apObjectJoiBuilder = (additionalKeys: SchemaMap<any> = {}) =>
  Joi.object({
    type: Joi.alternatives()
      .try(
        Joi.string().max(512).trim(false),
        Joi.array().items(Joi.string().max(512).trim(false))
      )
      .required(),
    id: Joi.string().max(2048).trim(false).uri(),

    attachment: apObjectOrLinkOrArrayJoi,
    attributedTo: apObjectOrLinkOrArrayJoi,
    audience: apObjectOrLinkOrArrayJoi,
    content: Joi.string().max(5000),
    contentMap: Joi.object().pattern(/.*/, Joi.string().max(5000)),
    name: Joi.string().max(240),
    nameMap: Joi.object().pattern(/.*/, Joi.string().max(240)),
    endTime: Joi.string().isoDate(),
    generator: apObjectOrLinkOrArrayJoi,
    icon: apObjectOrLinkOrArrayJoi,
    image: apObjectOrLinkOrArrayJoi,
    inReplyTo: apObjectOrLinkOrArrayJoi,
    location: apObjectOrLinkOrArrayJoi,
    preview: apObjectOrLinkOrArrayJoi,
    published: Joi.string().isoDate(),
    replies: apCollectionOrLinkJoi,
    startTime: Joi.string().isoDate(),
    summary: Joi.string().max(2000),
    summaryMap: Joi.object().pattern(/.*/, Joi.string().max(2000)),
    tag: apObjectOrLinkOrArrayJoi,
    updated: Joi.string().isoDate(),
    url: Joi.array().items(Joi.string().uri()),
    to: apObjectOrLinkOrArrayJoi,
    bto: apObjectOrLinkOrArrayJoi,
    cc: apObjectOrLinkOrArrayJoi,
    bcc: apObjectOrLinkOrArrayJoi,
    mediaType: Joi.string().max(64).trim(false),
    duration: Joi.string().max(64).trim(false),

    context: apObjectOrLinkOrArrayJoi,
    source: Joi.object().keys({
      content: Joi.string().max(5000).required(),
      mediaType: Joi.string().max(64).trim(false).required(),
    }),
    likes: apCollectionOrLinkJoi,
    shares: apCollectionOrLinkJoi,

    ...additionalKeys,
  }).id('APObject');
