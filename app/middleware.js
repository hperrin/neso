import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';

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
const {
  nymph,
  tilmeld,
  User,
  Group,
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
};
