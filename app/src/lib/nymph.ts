import { get } from 'svelte/store';
import type { NymphOptions } from '@nymphjs/client';
import { Nymph, PubSub } from '@nymphjs/client';
import {
  User as UserClass,
  Group as GroupClass,
} from '@nymphjs/tilmeld-client';
import websocket from 'websocket';
import type { Stores } from '$lib/stores';
import stores from '$lib/stores';
import { Project as ProjectClass } from '$lib/entities/Project.js';
import type { ProjectData } from '$lib/entities/Project.js';
import { Settings as SettingsClass } from '$lib/entities/Settings.js';
import type { SettingsData } from '$lib/entities/Settings.js';
import { Todo as TodoClass } from '$lib/entities/Todo.js';
import type { TodoData } from '$lib/entities/Todo.js';
import { AuthClient as AuthClientClass } from '$lib/entities/AuthClient.js';
import type { AuthClientData } from '$lib/entities/AuthClient.js';
import { SocialActivity as SocialActivityClass } from '$lib/entities/SocialActivity.js';
import type { SocialActivityData } from '$lib/entities/SocialActivity.js';
import { SocialActor as SocialActorClass } from '$lib/entities/SocialActor.js';
import type { SocialActorData } from '$lib/entities/SocialActor.js';
import { SocialObject as SocialObjectClass } from '$lib/entities/SocialObject.js';
import type { SocialObjectData } from '$lib/entities/SocialObject.js';

export type SessionStuff = {
  nymph: Nymph;
  pubsub: PubSub;
  stores: Stores;
  User: typeof UserClass;
  Group: typeof GroupClass;
  Project: typeof ProjectClass;
  Settings: typeof SettingsClass;
  Todo: typeof TodoClass;
  AuthClient: typeof AuthClientClass;
  SocialActivity: typeof SocialActivityClass;
  SocialActor: typeof SocialActorClass;
  SocialObject: typeof SocialObjectClass;
};

const { w3cwebsocket } = websocket;

export const nymphBuilder = (
  fetch?: WindowOrWorkerGlobalScope['fetch'],
  browser: boolean = false,
  DOMAIN: string = '127.0.0.1',
  SECURE: boolean = false
) => {
  const SERVER =
    DOMAIN === '127.0.0.1'
      ? 'http://127.0.0.1:5173'
      : DOMAIN === 'localhost'
      ? 'http://localhost:5173'
      : `${SECURE ? 'https' : 'http'}://${DOMAIN}`;
  const PUBSUB_SERVER = SERVER.replace(/^http(s?)/, 'ws$1').replace(
    /:5173/,
    () => ':8080'
  );

  const nymphOptions: NymphOptions = {
    restUrl: `${SERVER}/rest`,
    weakCache: true,
    pubsubUrl: PUBSUB_SERVER,
    WebSocket:
      typeof window !== 'undefined'
        ? window.WebSocket
        : (w3cwebsocket as unknown as typeof WebSocket),
    fetch,
    noAutoconnect: !browser,
  };

  const nymph = new Nymph(nymphOptions);
  const pubsub = new PubSub(nymphOptions, nymph);

  const User = nymph.addEntityClass(UserClass);
  User.init(nymph);
  const Group = nymph.addEntityClass(GroupClass);
  const Project = nymph.addEntityClass(ProjectClass);
  const Settings = nymph.addEntityClass(SettingsClass);
  const Todo = nymph.addEntityClass(TodoClass);
  const AuthClient = nymph.addEntityClass(AuthClientClass);
  const SocialActivity = nymph.addEntityClass(SocialActivityClass);
  const SocialActor = nymph.addEntityClass(SocialActorClass);
  const SocialObject = nymph.addEntityClass(SocialObjectClass);

  SocialObject.localAddress = `${SERVER}/`;

  // Help with dev.
  if (typeof window !== 'undefined') {
    (window as any).dev = {
      nymph,
      pubsub,
      User,
      Group,
      Project,
      Settings,
      Todo,
      AuthClient,
      SocialActivity,
      SocialActor,
      SocialObject,
    };
  }

  return {
    nymph,
    pubsub,
    User,
    Group,
    Project,
    Settings,
    Todo,
    AuthClient,
    SocialActivity,
    SocialActor,
    SocialObject,
  };
};

export let buildSessionStuff = (
  fetch: WindowOrWorkerGlobalScope['fetch'],
  tokens: { xsrfToken?: string; token?: string },
  browser?: boolean,
  DOMAIN?: string,
  SECURE?: boolean
): SessionStuff => {
  const {
    nymph,
    pubsub,
    User,
    Group,
    Project,
    Settings,
    Todo,
    AuthClient,
    SocialActivity,
    SocialActor,
    SocialObject,
  } = nymphBuilder(fetch, browser, DOMAIN, !!SECURE);
  const myStores = stores({ pubsub, Project, Settings });
  const {
    user,
    clientConfig,
    readyPromiseResolve,
    readyPromiseReject,
    settingsReadyPromise,
    projectsReadyPromise,
  } = myStores;

  if (tokens.xsrfToken && tokens.token) {
    nymph.setXsrfToken(tokens.xsrfToken);
    pubsub.setToken(tokens.token);
  }

  const readyNecessaryPromises = [];
  readyNecessaryPromises.push(
    User.getClientConfig().then(
      (config) => clientConfig.set(config),
      readyPromiseReject
    )
  );
  User.on('login', (currentUser) => {
    user.set(currentUser);
  });
  User.on('logout', () => {
    user.set(null);
  });
  readyNecessaryPromises.push(
    User.current().then((currentUser) => {
      user.set(currentUser);
      return Promise.all([
        get(settingsReadyPromise),
        get(projectsReadyPromise),
      ]);
    }, readyPromiseReject)
  );
  Promise.all(readyNecessaryPromises).then(() => readyPromiseResolve());

  return {
    nymph,
    pubsub,
    stores: myStores,
    User,
    Group,
    Project,
    Settings,
    Todo,
    AuthClient,
    SocialActivity,
    SocialActor,
    SocialObject,
  };
};

export type {
  UserClass,
  GroupClass,
  ProjectClass,
  ProjectData,
  SettingsClass,
  SettingsData,
  TodoClass,
  TodoData,
  AuthClientClass,
  AuthClientData,
  SocialActivityClass,
  SocialActivityData,
  SocialActorClass,
  SocialActorData,
  SocialObjectClass,
  SocialObjectData,
};
