import http from 'node:http';
import https from 'node:https';
import express from 'express';
import helmet from 'helmet';
import { server as WebSocketServer } from 'websocket';
import { PubSub } from '@nymphjs/pubsub';

import { handler } from './build/handler.js';
import {
  PORT,
  ADDRESS,
  WSADDRESS,
  nymph,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
} from './middleware.js';

console.log('Loading server...');

const pubSubConfig = {
  originIsAllowed: (origin) =>
    origin == null || // Happens when accessing from Node.js during SSR.
    origin === ADDRESS ||
    origin.startsWith(ADDRESS + (ADDRESS.endsWith('/') ? '' : '/')),
  entries: [WSADDRESS],
};

const app = express();

if (process.env.CERT) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
}

app.use('/rest', corsMiddleware);
app.use('/rest', restMiddleware);
app.use('/user', tilmeldSetupMiddleware);

app.use(handler);

let server;

function createPubSub(server) {
  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });
  new PubSub(pubSubConfig, nymph, wsServer);
}

if (process.env.CERT) {
  const cert = process.env.CERT;
  const key = process.env.KEY;
  const dhparam = process.env.DH_PARAM;
  const redirectPort = process.env.REDIRECT_PORT;

  console.log('Listening on ', PORT);

  const server = https.createServer({ cert, key, dhparam }, app).listen(PORT);
  createPubSub(server);

  if (redirectPort) {
    const redirectApp = express();

    redirectApp.use((req, res, next) => {
      if (req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1') {
        // Skip redirection for local requests.
        return next();
      }

      // For remote requests, redirect to the secure app.
      return res.redirect('https://' + req.headers.host + req.url);
    });

    // Handle the request like normal for SSR connections.
    redirectApp.use(app);

    redirectApp.listen(Number(redirectPort));
    createPubSub(redirectApp);
  }
} else {
  console.log('Listening on ', PORT);
  server = http.createServer(app).listen(PORT);
  createPubSub(server);
}
