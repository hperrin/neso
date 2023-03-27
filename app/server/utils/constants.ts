export const AP_PUBLIC_ADDRESS = 'https://www.w3.org/ns/activitystreams#Public';

export const AP_ROUTES = {
  actor: '/users/:actor',
  object: '/objects/:id',
  activity: '/activites/:id',
  inbox: '/inbox/:actor',
  outbox: '/outbox/:actor',
  followers: '/followers/:actor',
  following: '/following/:actor',
  liked: '/liked/:actor',
  shares: '/activites/:id/shares',
  likes: '/activites/:id/likes',
  collections: '/users/:actor/c/:id',
  blocked: '/users/:actor/blocked',
  rejections: '/users/:actor/rejections',
  rejected: '/users/:actor/rejected',
  nodeinfo: '/nodeinfo',
};

export const AP_USER_ID_PREFIX = 'http://127.0.0.1:5173/users/';
export const AP_USER_INBOX_PREFIX = 'http://127.0.0.1:5173/inbox/';
export const AP_USER_OUTBOX_PREFIX = 'http://127.0.0.1:5173/outbox/';
export const AP_USER_FOLLOWERS_PREFIX = 'http://127.0.0.1:5173/followers/';
export const AP_USER_FOLLOWING_PREFIX = 'http://127.0.0.1:5173/following/';
export const AP_USER_LIKED_PREFIX = 'http://127.0.0.1:5173/liked/';
