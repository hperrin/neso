import { generateKeyPair } from 'node:crypto';
import type { User, UserData } from '@nymphjs/tilmeld';
import type { APEXActor } from 'activitypub-express';

import {
  AP_USER_ID_PREFIX,
  AP_USER_INBOX_PREFIX,
  AP_USER_OUTBOX_PREFIX,
  AP_USER_FOLLOWERS_PREFIX,
  AP_USER_FOLLOWING_PREFIX,
  AP_USER_LIKED_PREFIX,
} from '../utils/constants.js';

import type { SocialActor as SocialActorClass } from '../entities/SocialActor.js';

export default async function handleOnboarding(
  user: User & UserData,
  ADDRESS: string
) {
  const nymph = user.$nymph.clone();

  const SocialActor = nymph.getEntityClass(
    'SocialActor'
  ) as typeof SocialActorClass;

  const actor = await SocialActor.factory();

  actor.$acceptAPObject(
    {
      type: 'Person',
      id: `${AP_USER_ID_PREFIX(ADDRESS)}${user.username}`,
      name: user.name,
      preferredUsername: user.username,
      inbox: `${AP_USER_INBOX_PREFIX(ADDRESS)}${user.username}`,
      outbox: `${AP_USER_OUTBOX_PREFIX(ADDRESS)}${user.username}`,
      followers: `${AP_USER_FOLLOWERS_PREFIX(ADDRESS)}${user.username}`,
      following: `${AP_USER_FOLLOWING_PREFIX(ADDRESS)}${user.username}`,
      liked: `${AP_USER_LIKED_PREFIX(ADDRESS)}${user.username}`,
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: user.$getAvatar(),
      },
    } as APEXActor,
    true
  );

  // Create a key pair.
  const [publicKey, privateKey] = await new Promise<[string, string]>(
    (resolve, reject) =>
      generateKeyPair(
        'rsa',
        {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        },
        (error, publicKey, privateKey) => {
          if (error) {
            reject(error);
          }
          resolve([publicKey, privateKey]);
        }
      )
  );

  actor.user = user;
  actor.publicKey = {
    id: `${AP_USER_ID_PREFIX(ADDRESS)}${user.username}#main-key`,
    owner: `${AP_USER_ID_PREFIX(ADDRESS)}${user.username}`,
    publicKeyPem: publicKey,
  };
  actor._meta = {
    privateKey,
  };

  try {
    if (!(await actor.$saveSkipAC())) {
      throw new Error("Couldn't create actor for user.");
    }
  } catch (e) {
    console.error('Error:', e);
    throw e;
  }
}
