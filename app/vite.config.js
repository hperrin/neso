import { sveltekit } from '@sveltejs/kit/vite';
import nymphjsPubsub from '@nymphjs/pubsub';

import {
  nymph,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
  WSADDRESS,
  WSPORT,
} from './middleware.js';

const { default: createServer } = nymphjsPubsub;

const nymphApp = () => {
  let pubSubServer = null;
  return {
    name: 'nymph-middleware',
    configureServer(server) {
      server.middlewares.use('/rest', corsMiddleware);
      server.middlewares.use('/rest', restMiddleware);
      server.middlewares.use('/user', tilmeldSetupMiddleware);
      if (pubSubServer) {
        pubSubServer.close();
      }
      pubSubServer = createServer(
        WSPORT,
        {
          originIsAllowed: (origin) =>
            origin == null || // Happens when accessing from Node.js during SSR.
            origin.startsWith('http://localhost:5173') ||
            origin.startsWith('http://127.0.0.1:5173'),
          entries: [WSADDRESS],
        },
        nymph
      );
    },
  };
};

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [nymphApp(), sveltekit()],
};

export default config;
