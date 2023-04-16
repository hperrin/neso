import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NymphDriver } from '@nymphjs/nymph';
import { Nymph } from '@nymphjs/nymph';
import { PubSub } from '@nymphjs/pubsub';
import {
  Tilmeld,
  User as UserClass,
  Group as GroupClass,
} from '@nymphjs/tilmeld';
import { createServer } from '@nymphjs/server';
import { setup } from '@nymphjs/tilmeld-setup';
import type { Express } from 'express';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';

import { MySQLDriver } from '@nymphjs/driver-mysql';
import { SQLite3Driver } from '@nymphjs/driver-sqlite3';

import handleOnboarding from './utils/handleOnboarding.js';
import { Project as ProjectClass } from './entities/Project.js';
import type { ProjectData } from './entities/Project.js';
import { Settings as SettingsClass } from './entities/Settings.js';
import type { SettingsData } from './entities/Settings.js';
import { Todo as TodoClass } from './entities/Todo.js';
import type { TodoData } from './entities/Todo.js';
import { AuthClient as AuthClientClass } from './entities/AuthClient.js';
import type { AuthClientData } from './entities/AuthClient.js';
import { AuthCode as AuthCodeClass } from './entities/AuthCode.js';
import type { AuthCodeData } from './entities/AuthCode.js';
import { AuthToken as AuthTokenClass } from './entities/AuthToken.js';
import type { AuthTokenData } from './entities/AuthToken.js';
import { SocialContext as SocialContextClass } from './entities/SocialContext.js';
import type { SocialContextData } from './entities/SocialContext.js';
import { SocialDelivery as SocialDeliveryClass } from './entities/SocialDelivery.js';
import type { SocialDeliveryData } from './entities/SocialDelivery.js';
import { SocialActivity as SocialActivityClass } from './entities/SocialActivity.js';
import type { SocialActivityData } from './entities/SocialActivity.js';
import { SocialActor as SocialActorClass } from './entities/SocialActor.js';
import type { SocialActorData } from './entities/SocialActor.js';
import { SocialObject as SocialObjectClass } from './entities/SocialObject.js';
import type { SocialObjectData } from './entities/SocialObject.js';
import { SocialObjectBase as SocialObjectBaseClass } from './entities/SocialObjectBase.js';
import type { SocialObjectBaseData } from './entities/SocialObjectBase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT ?? process.env.PROD_PORT ?? 5173);
export const DOMAIN = process.env.DOMAIN ?? '127.0.0.1';
export const PROTO = process.env.CERT || PORT === 443 ? 'https' : 'http';
export const WSPORT = Number(
  process.env.WSPORT ?? process.env.PORT ?? process.env.PROD_PORT ?? 8080
);
export const WSDOMAIN = process.env.WSDOMAIN ?? DOMAIN;
export const WSPROTO = process.env.CERT || WSPORT === 443 ? 'wss' : 'ws';

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = Number(process.env.MYSQL_PORT ?? 3306);
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'nymph';
const MYSQL_USER = process.env.MYSQL_USER ?? 'nymph';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_CA_CERT = process.env.MYSQL_CA_CERT;

export type {
  ProjectClass,
  ProjectData,
  SettingsClass,
  SettingsData,
  TodoClass,
  TodoData,
  AuthClientClass,
  AuthClientData,
  AuthCodeClass,
  AuthCodeData,
  AuthTokenClass,
  AuthTokenData,
  SocialContextClass,
  SocialContextData,
  SocialDeliveryClass,
  SocialDeliveryData,
  SocialActivityClass,
  SocialActivityData,
  SocialActorClass,
  SocialActorData,
  SocialObjectClass,
  SocialObjectData,
  SocialObjectBaseClass,
  SocialObjectBaseData,
};

export type NymphInstance = {
  nymph: Nymph;
  tilmeld: Tilmeld;
  User: typeof UserClass;
  Group: typeof GroupClass;
  Project: typeof ProjectClass;
  Settings: typeof SettingsClass;
  Todo: typeof TodoClass;
  AuthClient: typeof AuthClientClass;
  AuthCode: typeof AuthCodeClass;
  AuthToken: typeof AuthTokenClass;
  SocialContext: typeof SocialContextClass;
  SocialDelivery: typeof SocialDeliveryClass;
  SocialActivity: typeof SocialActivityClass;
  SocialActor: typeof SocialActorClass;
  SocialObject: typeof SocialObjectClass;
  SocialObjectBase: typeof SocialObjectBaseClass;
  restMiddleware: Express;
  tilmeldSetupMiddleware: Express;
  corsMiddleware: Express;
};

const FLATPAK_IDE_ENV = process.env.FLATPAK_IDE_ENV == '1';
export const JWT_SECRET = process.env.JWT_SECRET ?? '';
const EXT =
  (PROTO === 'https' && PORT === 443) || (PROTO === 'http' && PORT === 80)
    ? ''
    : `:${PORT}`;
const WSEXT =
  (WSPROTO === 'wss' && WSPORT === 443) || (WSPROTO === 'ws' && WSPORT === 80)
    ? ''
    : `:${WSPORT}`;

export const ADDRESS = `${PROTO}://${DOMAIN}${EXT}`;
export const WSADDRESS = `${WSPROTO}://${WSDOMAIN}${WSEXT}`;
// Allow all local connections.
const allowlist = [
  ADDRESS,
  `http://127.0.0.1${EXT}`,
  `https://127.0.0.1${EXT}`,
  `http://localhost${EXT}`,
  `https://localhost${EXT}`,
];
const corsOptions: CorsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (origin == null || allowlist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
};

export function getNymphInstance({
  devDB = resolve(__dirname, '..', '..', '..', 'development.db'),
}: {
  devDB?: string;
} = {}): NymphInstance {
  let nymph: Nymph = null as unknown as Nymph;
  let tilmeld: Tilmeld = null as unknown as Tilmeld;
  let driver: NymphDriver = null as unknown as NymphDriver;
  let User = UserClass;
  let Group = GroupClass;
  let Project = ProjectClass;
  let Settings = SettingsClass;
  let Todo = TodoClass;
  let AuthClient = AuthClientClass;
  let AuthCode = AuthCodeClass;
  let AuthToken = AuthTokenClass;
  let SocialContext = SocialContextClass;
  let SocialDelivery = SocialDeliveryClass;
  let SocialActivity = SocialActivityClass;
  let SocialActor = SocialActorClass;
  let SocialObject = SocialObjectClass;
  let SocialObjectBase = SocialObjectBaseClass;
  let restMiddleware: Express = express();
  let tilmeldSetupMiddleware: Express = express();
  let corsMiddleware = cors(corsOptions) as unknown as Express;

  if (!FLATPAK_IDE_ENV) {
    if (MYSQL_HOST != null && MYSQL_PASSWORD != null) {
      driver = new MySQLDriver({
        customPoolConfig: {
          host: MYSQL_HOST,
          port: MYSQL_PORT,
          user: MYSQL_USER,
          password: MYSQL_PASSWORD,
          database: MYSQL_DATABASE,
          ssl: {
            minVersion: 'TLSv1.2',
            ...(MYSQL_CA_CERT ? { ca: MYSQL_CA_CERT } : {}),
          },
          connectionLimit: 1000,
          connectTimeout: 60 * 60 * 1000,
          acquireTimeout: 60 * 60 * 1000,
          timeout: 60 * 60 * 1000,
          enableKeepAlive: true,
        },
      });
    } else {
      driver = new SQLite3Driver({
        filename: devDB,
        wal: true,
        timeout: 30000,
      });
    }

    tilmeld = new Tilmeld({
      appName: 'Neso',
      appUrl: ADDRESS,
      cookieDomain: DOMAIN,
      cookiePath: '/',
      setupPath: '/user',
      emailUsernames: false,
      userFields: ['name', 'email'],
      verifyRedirect: `${ADDRESS}/verified`,
      verifyChangeRedirect: ADDRESS,
      cancelChangeRedirect: ADDRESS,
      jwtSecret: JWT_SECRET,
      enableUserSearch: true,
    });

    nymph = new Nymph({}, driver, tilmeld);
    PubSub.initPublisher(
      {
        entries: [WSADDRESS],
      },
      nymph
    );

    Project = nymph.addEntityClass(ProjectClass);
    Settings = nymph.addEntityClass(SettingsClass);
    Todo = nymph.addEntityClass(TodoClass);
    AuthClient = nymph.addEntityClass(AuthClientClass);
    AuthCode = nymph.addEntityClass(AuthCodeClass);
    AuthToken = nymph.addEntityClass(AuthTokenClass);
    SocialContext = nymph.addEntityClass(SocialContextClass);
    SocialDelivery = nymph.addEntityClass(SocialDeliveryClass);
    SocialActivity = nymph.addEntityClass(SocialActivityClass);
    SocialActor = nymph.addEntityClass(SocialActorClass);
    SocialObject = nymph.addEntityClass(SocialObjectClass);
    SocialObjectBase = nymph.addEntityClass(SocialObjectBaseClass);

    User = tilmeld.User;
    Group = tilmeld.Group;

    User.on('afterRegister', async (user) => {
      if (user.username != 'root') {
        await handleOnboarding(user);
      }
    });

    restMiddleware = createServer(nymph, { jsonOptions: { limit: '25mb' } });
    tilmeldSetupMiddleware = setup(
      {
        restUrl: `${ADDRESS}/rest`,
      },
      nymph
    );
  }

  return {
    nymph,
    tilmeld,
    User,
    Group,
    Project,
    Settings,
    Todo,
    AuthClient,
    AuthCode,
    AuthToken,
    SocialContext,
    SocialDelivery,
    SocialActivity,
    SocialActor,
    SocialObject,
    SocialObjectBase,
    restMiddleware,
    tilmeldSetupMiddleware,
    corsMiddleware,
  };
}
