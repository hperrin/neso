import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import OAuth2Server, {
  Request,
  Response,
  UnauthorizedRequestError,
} from 'oauth2-server';
import { HttpError } from '@nymphjs/server';
import { nanoid } from '@nymphjs/guid';

import {
  getNymphInstance,
  ADDRESS,
  PORT,
  WSADDRESS,
  WSPORT,
} from './build/nymph/nymph.js';
import { buildApex } from './build/nymph/apex.js';
import { AP_ROUTES, AP_USER_ID_PREFIX } from './build/nymph/utils/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, '..', 'package.json'))
);

const {
  nymph,
  tilmeld,
  User,
  Group,
  AuthClient,
  AuthCode,
  AuthToken,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
} = getNymphInstance({
  devDB: path.resolve(__dirname, '..', 'development.db'),
});

const apex = buildApex(nymph);

const apexRunner = (middlewares) => {
  return async (req, res, next) => {
    // TODO: This is unsafe. It should require XSRF token or a local connection.
    if ('TILMELDAUTH' in (req.cookies ?? {})) {
      const authNymph = nymph.clone();
      authNymph.tilmeld.request = req;
      authNymph.tilmeld.response = res;
      if (authNymph.tilmeld.authenticate(true)) {
        res.locals.apex.authorizedUserId = `${AP_USER_ID_PREFIX}${authNymph.tilmeld.currentUser.username}`;
      }
    }

    for (let fn of middlewares) {
      try {
        await new Promise((resolve, reject) => {
          fn(req, res, (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        });
      } catch (e) {
        next(e.message);
        break;
      }
    }
  };
};

const apexMiddleware = express();
apexMiddleware.use(
  cookieParser(),
  express.json({ type: apex.consts.jsonldTypes }),
  express.urlencoded({ extended: true }),
  apex
);

apexMiddleware
  .route(AP_ROUTES.inbox)
  .get(apexRunner(apex.net.inbox.get))
  .post(apexRunner(apex.net.inbox.post));
apexMiddleware
  .route(AP_ROUTES.outbox)
  .get(apexRunner(apex.net.outbox.get))
  .post(apexRunner(apex.net.outbox.post));
apexMiddleware.get(AP_ROUTES.actor, apexRunner(apex.net.actor.get));
apexMiddleware.get(AP_ROUTES.followers, apexRunner(apex.net.followers.get));
apexMiddleware.get(AP_ROUTES.following, apexRunner(apex.net.following.get));
apexMiddleware.get(AP_ROUTES.liked, apexRunner(apex.net.liked.get));
apexMiddleware.get(AP_ROUTES.object, apexRunner(apex.net.object.get));
apexMiddleware.get(AP_ROUTES.activity, apexRunner(apex.net.activityStream.get));
apexMiddleware.get(AP_ROUTES.shares, apexRunner(apex.net.shares.get));
apexMiddleware.get(AP_ROUTES.likes, apexRunner(apex.net.likes.get));
apexMiddleware.get(
  '/.well-known/webfinger',
  apexRunner(apex.net.webfinger.get)
);
apexMiddleware.get(
  '/.well-known/nodeinfo',
  apexRunner(apex.net.nodeInfoLocation.get)
);
apexMiddleware.get('/nodeinfo/:version', apexRunner(apex.net.nodeInfo.get));
apexMiddleware.post('/proxy', apexRunner(apex.net.proxy.post));

// list of valid scopes
const VALID_SCOPES = ['read', 'write', 'follow'];

const oauth = new OAuth2Server({
  // See: https://oauth2-server.readthedocs.io/en/latest/model/spec.html
  model: {
    // These functions are optional.
    // getAccessToken: async (client, user, scope) => {
    //   return;
    // },
    // generateRefreshToken: async (client, user, scope) => {
    //   return;
    // },
    // getAuthorizationCode: async (client, user, scope) => {
    //   return;
    // },
    // This function is only required for client_credentials grant.
    // getUserFromClient: async (client) => {
    //   return;
    // },

    getAccessToken: async (accessToken) => {
      return await nymph.getEntity(
        { class: AuthToken, skipAc: true },
        {
          type: '&',
          equal: ['accessToken', accessToken],
        }
      );
    },

    getRefreshToken: async (refreshToken) => {
      return await nymph.getEntity(
        { class: AuthToken, skipAc: true },
        {
          type: '&',
          equal: ['refreshToken', refreshToken],
        }
      );
    },

    getAuthorizationCode: async (authorizationCode) => {
      return await nymph.getEntity(
        { class: AuthCode, skipAc: true },
        {
          type: '&',
          '!tag': 'revoked',
          equal: ['authorizationCode', authorizationCode],
        }
      );
    },

    getClient: async (clientId, clientSecret) => {
      return await nymph.getEntity(
        { class: AuthClient, skipAc: true },
        {
          type: '&',
          equal: [
            ['id', clientId],
            ['secret', clientSecret],
          ],
        }
      );
    },

    getUser: async (username, password) => {
      const user = await User.factoryUsername(username);

      if (user.guid == null) {
        return null;
      }

      if (!user.$checkPassword(password)) {
        return null;
      }

      return user;
    },

    saveToken: async (token, client, user) => {
      let nymphClient =
        client.guid != null
          ? client
          : await nymph.getEntity(
              {
                class: AuthClient,
                skipAc: true,
              },
              {
                type: '&',
                equal: ['id', client.id],
              }
            );

      if (nymphClient == null) {
        throw new Error("Couldn't get client.");
      }

      let nymphAuthToken = null;
      let nymphRefreshToken = null;

      if (token.accessToken) {
        let nymphAuthToken = await nymph.getEntity(
          {
            class: AuthToken,
            skipAc: true,
          },
          {
            type: '&',
            ref: ['user', user.guid],
            equal: ['accessToken', token.accessToken],
          }
        );

        if (nymphAuthToken == null) {
          nymphAuthToken = await AuthToken.factory();
        }

        nymphAuthToken.client = nymphClient;
        nymphAuthToken.user = user;
        nymphAuthToken.accessToken = token.accessToken;
        nymphAuthToken.accessTokenExpiresAt = token.accessTokenExpiresAt;
        if (token.scope != null) {
          nymphAuthToken.scope = token.scope;
        }

        if (!(await nymphAuthToken.$saveSkipAC())) {
          throw new Error("Couldn't save auth token.");
        }
      }

      if (token.refreshToken) {
        let nymphRefreshToken = await nymph.getEntity(
          {
            class: AuthToken,
            skipAc: true,
          },
          {
            type: '&',
            ref: ['user', user.guid],
            equal: ['refreshToken', token.refreshToken],
          }
        );

        if (nymphRefreshToken == null) {
          nymphRefreshToken = await AuthToken.factory();
        }

        nymphRefreshToken.client = nymphClient;
        nymphRefreshToken.user = user;
        nymphRefreshToken.refreshToken = token.refreshToken;
        nymphRefreshToken.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
        if (token.scope != null) {
          nymphRefreshToken.scope = token.scope;
        }

        if (!(await nymphRefreshToken.$saveSkipAC())) {
          throw new Error("Couldn't save refresh token.");
        }
      }

      if (nymphAuthToken && !nymphRefreshToken) {
        return nymphAuthToken;
      } else if (!nymphAuthToken && nymphRefreshToken) {
        return nymphRefreshToken;
      }
      return {
        accessToken: nymphAuthToken.accessToken,
        accessTokenExpiresAt: nymphAuthToken.accessTokenExpiresAt,
        refreshToken: nymphRefreshToken.refreshToken,
        refreshTokenExpiresAt: nymphRefreshToken.refreshTokenExpiresAt,
        scope: nymphAuthToken.scope,
        client: nymphAuthToken.client,
        user: nymphAuthToken.user,
      };
    },

    saveAuthorizationCode: async (code, client, user) => {
      let nymphClient =
        client.guid != null
          ? client
          : await nymph.getEntity(
              {
                class: AuthClient,
                skipAc: true,
              },
              {
                type: '&',
                equal: ['id', client.id],
              }
            );

      if (nymphClient == null) {
        throw new Error("Couldn't get client.");
      }

      let nymphCode = await nymph.getEntity(
        {
          class: AuthCode,
          skipAc: true,
        },
        {
          type: '&',
          ref: ['user', user.guid],
          equal: ['authorizationCode', code.authorizationCode],
        }
      );

      if (nymphCode == null) {
        nymphCode = await AuthCode.factory();
      }

      nymphCode.authorizationCode = code.authorizationCode;
      nymphCode.expiresAt = code.expiresAt;
      nymphCode.redirectUri = code.redirectUri;
      nymphCode.client = nymphClient;
      nymphCode.user = user;
      if (code.scope != null) {
        nymphCode.scope = code.scope;
      }

      if (!(await nymphCode.$saveSkipAC())) {
        throw new Error("Couldn't save code.");
      }

      return nymphCode;
    },

    revokeToken: async (token) => {
      let nymphToken = await nymph.getEntity(
        {
          class: AuthToken,
          skipAc: true,
        },
        {
          type: '&',
          ref: ['user', token.user],
          equal: ['refreshToken', token.refreshToken],
        }
      );

      if (nymphToken == null) {
        return false;
      }

      if (!(await nymphToken.$deleteSkipAC())) {
        throw new Error("Couldn't revoke token.");
      }

      return true;
    },

    revokeAuthorizationCode: async (code) => {
      let nymphCode = await nymph.getEntity(
        {
          class: AuthCode,
          skipAc: true,
        },
        {
          type: '&',
          ref: ['user', token.user],
          equal: ['authorizationCode', code.authorizationCode || code.code],
        }
      );

      if (nymphCode == null) {
        return false;
      }

      nymphCode.$addTag('revoked');

      if (!(await nymphCode.$saveSkipAC())) {
        throw new Error("Couldn't revoke code.");
      }

      return true;
    },

    validateScope: async (_user, client, scope) => {
      const clientScopes = client.scopes.split(' ');
      const validScopes = VALID_SCOPES.filter(
        (s) => clientScopes.inexOf(s) !== -1
      );

      if (
        !(Array.isArray(scope) ? scope : scope.split(' ')).every(
          (s) => validScopes.indexOf(s) >= 0
        )
      ) {
        return false;
      }
      return scope;
    },

    verifyScope: async (accessToken, scope) => {
      if (!accessToken.scope) {
        return false;
      }
      let requestedScopes = Array.isArray(scope) ? scope : scope.split(' ');
      let authorizedScopes = Array.isArray(accessToken.scope)
        ? accessToken.scope
        : accessToken.scope.split(' ');
      return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
    },
  },
});

/**
 * Authentication Middleware
 */
const oauthAuthenticateMiddleware = (options) => {
  return async (req, res, next) => {
    try {
      const request = new Request(req);
      const response = new Response(res);
      try {
        const token = await oauth.authenticate(request, response, options);
        res.locals.oauth = { token: token };
        res.locals.user = token.user;
        next();
      } catch (e) {
        if (e instanceof UnauthorizedRequestError) {
          next();
          return;
        }

        return handleError(e, req, res, response);
      }
    } catch (e) {
      return handleError(e, req, res);
    }
  };
};

/**
 * Authorization Middleware
 */
const oauthAuthorizeMiddleware = (options) => {
  return async (req, res, next) => {
    try {
      const request = new Request(req);
      const response = new Response(res);
      try {
        const code = await oauth.authorize(request, response, options);
        res.locals.oauth = { code: code };
        if (options.continueMiddleware) {
          next();
        }

        return handleResponse(req, res, response);
      } catch (e) {
        return handleError(e, req, res, response);
      }
    } catch (e) {
      return handleError(e, req, res);
    }
  };
};

/**
 * Grant Token Middleware
 */
const oauthTokenMiddleware = (options) => {
  return async (req, res, next) => {
    try {
      const request = new Request(req);
      const response = new Response(res);
      try {
        const token = await oauth.token(request, response, options);
        res.locals.oauth = { token: token };
        if (options.continueMiddleware) {
          next();
        }

        return handleResponse(req, res, response);
      } catch (e) {
        return handleError(e, req, res, response);
      }
    } catch (e) {
      return handleError(e, req, res);
    }
  };
};

/**
 * Handle response.
 */
const handleResponse = function (req, res, response) {
  if (response.status === 302) {
    const location = response.headers.location;
    delete response.headers.location;
    res.set(response.headers);
    res.redirect(location);
  } else {
    res.set(response.headers);
    res.status(response.status).send(response.body);
  }
};

/**
 * Handle error.
 */
const handleError = (e, req, res, response) => {
  if (response) {
    res.set(response.headers);
  }

  res.status(e.code);

  if (e instanceof UnauthorizedRequestError) {
    return res.send();
  }

  res.send({ error: e.name, error_description: e.message });
};

const oauthMiddleware = express();
oauthMiddleware.use(
  cookieParser(),
  express.json({ type: apex.consts.jsonldTypes }),
  express.urlencoded({ extended: true })
);
oauthMiddleware.use(
  '/',
  oauthAuthenticateMiddleware({
    allowExtendedTokenAttributes: false,
  })
);
oauthMiddleware.use(
  '/oauth/authorize',
  oauthAuthorizeMiddleware({
    allowExtendedTokenAttributes: false,
  })
);
oauthMiddleware.use(
  '/oauth/token',
  oauthTokenMiddleware({
    allowExtendedTokenAttributes: false,
  })
);

oauthMiddleware.post('/api/v1/apps', async (req, res) => {
  if (req.body.client_name == null || req.body.redirect_uris == null) {
    res.status(400);
    res.send('Bad request.');
    return;
  }

  let nymphClient = await AuthClient.factory();
  nymphClient.id = nanoid();
  nymphClient.secret = nanoid();
  nymphClient.name = req.body.client_name;
  nymphClient.redirectUris = Array.isArray(req.body.redirect_uris)
    ? req.body.redirect_uris
    : [req.body.redirect_uris];
  if (req.body.scopes != null) {
    nymphClient.scopes = req.body.scopes;
  }
  if (req.body.website != null) {
    nymphClient.website = req.body.website;
  }

  try {
    if (!(await nymphClient.$saveSkipAC())) {
      res.status(500);
      res.send("Couldn't save client.");
      return;
    }

    res.status(200);
    res.header('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        id: nymphClient.guid,
        name: nymphClient.name,
        website: nymphClient.website || null,
        redirect_uri: nymphClient.redirectUris[0],
        client_id: nymphClient.id,
        client_secret: nymphClient.secret,
      })
    );
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status || 500);
      res.send(e.message || 'Internal server error.');
      return;
    }

    res.status(500);
    res.send(e.message || 'Internal server error.');
  }
});

oauthMiddleware.get('/api/v1/apps/verify_credentials', async (req, res) => {
  if (
    res.locals.oauth &&
    res.locals.oauth.token &&
    res.locals.oauth.token.client
  ) {
    const nymphClient = res.locals.oauth.token.client;

    res.status(200);
    res.header('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        id: nymphClient.guid,
        name: nymphClient.name,
        website: nymphClient.website || null,
        redirect_uri: nymphClient.redirectUris[0],
      })
    );
  } else {
    res.status(401);
    res.send('Access token is not valid.');
  }
});

oauthMiddleware.get('/api/v1/instance', async (req, res) => {
  const userCount = await nymph.getEntities({
    class: User,
    skipAc: true,
    return: 'count',
  });

  res.status(200);
  res.header('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      uri: pkg.instanceInfo.uri,
      title: pkg.instanceInfo.title,
      short_description: pkg.instanceInfo.short_description,
      description: pkg.instanceInfo.description,
      email: pkg.instanceInfo.email,
      thumbnail: pkg.instanceInfo.thumbnail,
      rules: pkg.instanceInfo.rules,
      version: pkg.version,
      stats: {
        user_count: userCount,
      },
      languages: ['en'],
      registrations: true,
      approval_required: false,
      invites_enabled: false,
      configuration: {
        accounts: {
          max_featured_tags: 10,
        },
        statuses: {
          max_characters: 500,
          max_media_attachments: 4,
          characters_reserved_per_url: 23,
        },
        media_attachments: {
          supported_mime_types: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/heic',
            'image/heif',
            'image/webp',
            'image/avif',
            'video/webm',
            'video/mp4',
            'video/quicktime',
            'video/ogg',
            'audio/wave',
            'audio/wav',
            'audio/x-wav',
            'audio/x-pn-wave',
            'audio/vnd.wave',
            'audio/ogg',
            'audio/vorbis',
            'audio/mpeg',
            'audio/mp3',
            'audio/webm',
            'audio/flac',
            'audio/aac',
            'audio/m4a',
            'audio/x-m4a',
            'audio/mp4',
            'audio/3gpp',
            'video/x-ms-asf',
          ],
          image_size_limit: 10485760,
          image_matrix_limit: 16777216,
          video_size_limit: 41943040,
          video_frame_rate_limit: 60,
          video_matrix_limit: 2304000,
        },
        polls: {
          max_options: 4,
          max_characters_per_option: 50,
          min_expiration: 300,
          max_expiration: 2629746,
        },
      },
    })
  );
});

export {
  PORT,
  ADDRESS,
  WSADDRESS,
  WSPORT,
  nymph,
  tilmeld,
  User,
  Group,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
  apexMiddleware,
  oauthMiddleware,
};
