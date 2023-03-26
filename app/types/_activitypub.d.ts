declare module '_activitypub' {
  export interface PublicKey {
    id: string;
    owner: string;
    publicKeyPem: string;
  }

  export interface Endpoints {
    proxyUrl?: string;
    oauthAuthorizationEndpoint?: string;
    oauthTokenEndpoint?: string;
    provideClientKey?: string;
    signClientKey?: string;
    sharedInbox?: string;
  }

  //
  // Base Types
  //

  export type APanyURI = string;
  export type APDateTime = string;
  export type APDuration = string;
  export type APLanguageTag = string;
  export type APMIMEMediaType = string;
  export type APLinkRel = string;

  export interface APBase {
    type: string | APanyURI | (string | APanyURI)[];
    id?: APanyURI | null;
  }

  export type APStringLink = string;

  export interface APObjectLink extends APBase {
    type: 'Link' | string | APanyURI | ('Link' | string | APanyURI)[];
    href: APanyURI;
    rel?: APLinkRel | APLinkRel[];
    mediaType?: APMIMEMediaType;
    name?: string;
    nameMap?: { [k: APLanguageTag]: string };
    hreflang?: APLanguageTag;
    height?: number;
    width?: number;
    preview?: APObject | APLink | (APObject | APLink)[];

    attributedTo?: APObject | APLink | (APObject | APLink)[];
  }

  export type APLink = APObjectLink | APStringLink;

  export interface APObject extends APBase {
    type: 'Object' | string | APanyURI | ('Object' | string | APanyURI)[];
    attachment?: APObject | APLink | (APObject | APLink)[];
    attributedTo?: APObject | APLink | (APObject | APLink)[];
    audience?: APObject | APLink | (APObject | APLink)[];
    content?: string;
    contentMap?: { [k: APLanguageTag]: string };
    name?: string;
    nameMap?: { [k: APLanguageTag]: string };
    endTime?: APDateTime;
    generator?: APObject | APLink | (APObject | APLink)[];
    icon?: APImageObject | APLink | (APImageObject | APLink)[];
    image?: APImageObject | APLink | (APImageObject | APLink)[];
    inReplyTo?: APObject | APLink | (APObject | APLink)[];
    location?: APObject | APLink | (APObject | APLink)[];
    preview?: APObject | APLink | (APObject | APLink)[];
    published?: APDateTime;
    replies?: APCollection;
    startTime?: APDateTime;
    summary?: string;
    summaryMap?: { [k: APLanguageTag]: string };
    tag?: APObject | APLink | (APObject | APLink)[];
    updated?: APDateTime;
    url?: APLink | APLink[];
    to?: APObject | APLink | (APObject | APLink)[];
    bto?: APObject | APLink | (APObject | APLink)[];
    cc?: APObject | APLink | (APObject | APLink)[];
    bcc?: APObject | APLink | (APObject | APLink)[];
    mediaType?: APMIMEMediaType;
    duration?: APDuration;

    context?: APObject | APLink | (APObject | APLink)[];
    source?: APObject;
    likes?: APCollection | APOrderedCollection | APLink | APanyURI;
    shares?: APCollection | APOrderedCollection | APLink | APanyURI;
  }

  //
  // Collections
  //

  export interface APCollection extends APObject {
    totalItems?: number;
    current?: APCollectionPage | APLink;
    first?: APCollectionPage | APLink;
    last?: APCollectionPage | APLink;
    items: APObject | APLink | (APObject | APLink)[];
  }

  export interface APOrderedCollection extends APCollection {
    items: never;
    orderedItems: APObject | APLink | (APObject | APLink)[];
  }

  export interface APCollectionPage extends APCollection {
    partOf?: APCollection | APLink;
    next?: APCollectionPage | APLink;
    prev?: APCollectionPage | APLink;
  }

  export interface APOrderedCollectionPage extends APCollectionPage {
    startIndex?: number;
  }

  //
  // Activities
  //

  export interface APActivity extends APObject {
    actor: APActor | APanyURI | (APActor | APanyURI)[] | string[];
    object?: APObject | APLink | (APObject | APLink)[];
    target?: APObject | APLink | (APObject | APLink)[];
    result?: APObject | APLink | (APObject | APLink)[];
    origin?: APObject | APLink | (APObject | APLink)[];
    instrument?: APObject | APLink | (APObject | APLink)[];
  }

  export interface APIntransitiveActivity extends APActivity {
    object: never;
  }

  export interface APAcceptActivity extends APActivity {
    type: 'Accept' | ('Accept' | string | APanyURI)[];
  }

  export interface APTentativeAcceptActivity extends APActivity {
    type: 'TentativeAccept' | ('TentativeAccept' | string | APanyURI)[];
  }

  export interface APAddActivity extends APActivity {
    type: 'Add' | ('Add' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
    target: APObject | APLink | (APObject | APLink)[];
  }

  export interface APArriveActivity extends APIntransitiveActivity {
    type: 'Arrive' | ('Arrive' | string | APanyURI)[];
  }

  export interface APCreateActivity extends APActivity {
    type: 'Create' | ('Create' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APDeleteActivity extends APActivity {
    type: 'Delete' | ('Delete' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APFollowActivity extends APActivity {
    type: 'Follow' | ('Follow' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APIgnoreActivity extends APActivity {
    type: 'Ignore' | ('Ignore' | string | APanyURI)[];
  }

  export interface APJoinActivity extends APActivity {
    type: 'Join' | ('Join' | string | APanyURI)[];
  }

  export interface APLeaveActivity extends APActivity {
    type: 'Leave' | ('Leave' | string | APanyURI)[];
  }

  export interface APLikeActivity extends APActivity {
    type: 'Like' | ('Like' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APOfferActivity extends APActivity {
    type: 'Offer' | ('Offer' | string | APanyURI)[];
  }

  export interface APInviteActivity extends APActivity {
    type: 'Invite' | ('Invite' | string | APanyURI)[];
    target: APObject | APLink | (APObject | APLink)[];
  }

  export interface APRejectActivity extends APActivity {
    type: 'Reject' | ('Reject' | string | APanyURI)[];
  }

  export interface APTentativeRejectActivity extends APActivity {
    type: 'TentativeReject' | ('TentativeReject' | string | APanyURI)[];
  }

  export interface APRemoveActivity extends APActivity {
    type: 'Remove' | ('Remove' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
    target: APObject | APLink | (APObject | APLink)[];
  }

  export interface APUndoActivity extends APActivity {
    type: 'Undo' | ('Undo' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APUpdateActivity extends APActivity {
    type: 'Update' | ('Update' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APViewActivity extends APActivity {
    type: 'View' | ('View' | string | APanyURI)[];
  }

  export interface APListenActivity extends APActivity {
    type: 'Listen' | ('Listen' | string | APanyURI)[];
  }

  export interface APReadActivity extends APActivity {
    type: 'Read' | ('Read' | string | APanyURI)[];
  }

  export interface APMoveActivity extends APActivity {
    type: 'Move' | ('Move' | string | APanyURI)[];
  }

  export interface APTravelActivity extends APIntransitiveActivity {
    type: 'Travel' | ('Travel' | string | APanyURI)[];
  }

  export interface APAnnounceActivity extends APActivity {
    type: 'Announce' | ('Announce' | string | APanyURI)[];
  }

  export interface APBlockActivity extends APActivity {
    type: 'Block' | ('Block' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APFlagActivity extends APActivity {
    type: 'Flag' | ('Flag' | string | APanyURI)[];
  }

  export interface APDislikeActivity extends APActivity {
    type: 'Dislike' | ('Dislike' | string | APanyURI)[];
    object: APObject | APLink | (APObject | APLink)[];
  }

  export interface APQuestionActivity extends APIntransitiveActivity {
    type: 'Question' | ('Question' | string | APanyURI)[];
    anyOf?: APObject | APLink | (APObject | APLink)[];
    oneOf?: APObject | APLink | (APObject | APLink)[];
    closed?:
      | APObject
      | APLink
      | APDateTime
      | boolean
      | (APObject | APLink | APDateTime | boolean)[];
  }

  //
  // Actors
  //

  export interface APActor extends APObject {
    inbox: string;
    outbox: string;
    following?: string;
    followers?: string;
    liked?: string;
    name?: string;
    preferredUsername?: string;
    summary?: string;
    streams?: string[];
    endpoints?: Endpoints | APanyURI;
    publicKey?: PublicKey;
    _meta?: {
      privateKey?: string;
    };
  }

  export interface APApplicationActor extends APActor {
    type: 'Application' | ('Application' | string | APanyURI)[];
  }

  export interface APGroupActor extends APActor {
    type: 'Group' | ('Group' | string | APanyURI)[];
  }

  export interface APOrganizationActor extends APActor {
    type: 'Organization' | ('Organization' | string | APanyURI)[];
  }

  export interface APPersonActor extends APActor {
    type: 'Person' | ('Person' | string | APanyURI)[];
  }

  export interface APServiceActor extends APActor {
    type: 'Service' | ('Service' | string | APanyURI)[];
  }

  //
  // Objects and Links
  //

  export interface APRelationshipObject extends APObject {
    type: 'Relationship' | ('Relationship' | string | APanyURI)[];
    subject: APObject | APLink;
    object: APObject | APLink | (APObject | APLink)[];
    relationship: APObject | APanyURI | (APObject | APanyURI)[];
  }

  export interface APArticleObject extends APObject {
    type: 'Article' | ('Article' | string | APanyURI)[];
  }

  export interface APArticleObject extends APObject {
    type: 'Article' | ('Article' | string | APanyURI)[];
  }

  export interface APDocumentObject extends APObject {
    type: 'Document' | ('Document' | string | APanyURI)[];
  }

  export interface APAudioObject extends APObject {
    type: 'Audio' | ('Audio' | string | APanyURI)[];
  }

  export interface APImageObject extends APObject {
    type: 'Image' | ('Image' | string | APanyURI)[];
  }

  export interface APVideoObject extends APObject {
    type: 'Video' | ('Video' | string | APanyURI)[];
  }

  export interface APNoteObject extends APObject {
    type: 'Note' | ('Note' | string | APanyURI)[];
  }

  export interface APPageObject extends APObject {
    type: 'Page' | ('Page' | string | APanyURI)[];
  }

  export interface APEventObject extends APObject {
    type: 'Event' | ('Event' | string | APanyURI)[];
  }

  export interface APPlaceObject extends APObject {
    type: 'Place' | ('Place' | string | APanyURI)[];
    accuracy?: number;
    altitude?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    units?: 'cm' | 'feet' | 'inches' | 'km' | 'm' | 'miles' | APanyURI;
  }

  export interface APMentionLink extends APObjectLink {
    type: 'Mention' | ('Mention' | string | APanyURI)[];
  }

  export interface APProfileObject extends APObject {
    type: 'Profile' | ('Profile' | string | APanyURI)[];
    describes: APObject | APanyURI;
  }

  export interface APTombstoneObject extends APObject {
    type: 'Tombstone' | ('Tombstone' | string | APanyURI)[];
    formerType: string | APanyURI | (string | APanyURI)[];
    deleted: APDateTime;
  }
}
