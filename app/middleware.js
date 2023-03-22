import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import {
  getNymphInstance,
  ADDRESS,
  PORT,
  WSADDRESS,
  WSPORT,
} from './build/nymph/nymph.js';
import { routes as apexRoutes, buildApex } from './build/nymph/apex.js';

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
  express.json({ type: apex.consts.jsonldTypes }),
  express.urlencoded({ extended: true }),
  apex
);

apexMiddleware
  .route(apexRoutes.inbox)
  .get(apexRunner(apex.net.inbox.get))
  .post(apexRunner(apex.net.inbox.post));
apexMiddleware
  .route(apexRoutes.outbox)
  .get(apexRunner(apex.net.outbox.get))
  .post(apexRunner(apex.net.outbox.post));
apexMiddleware.get(apexRoutes.actor, apexRunner(apex.net.actor.get));
apexMiddleware.get(apexRoutes.followers, apexRunner(apex.net.followers.get));
apexMiddleware.get(apexRoutes.following, apexRunner(apex.net.following.get));
apexMiddleware.get(apexRoutes.liked, apexRunner(apex.net.liked.get));
apexMiddleware.get(apexRoutes.object, apexRunner(apex.net.object.get));
apexMiddleware.get(
  apexRoutes.activity,
  apexRunner(apex.net.activityStream.get)
);
apexMiddleware.get(apexRoutes.shares, apexRunner(apex.net.shares.get));
apexMiddleware.get(apexRoutes.likes, apexRunner(apex.net.likes.get));
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
  apex,
  apexRoutes,
  apexMiddleware,
};
