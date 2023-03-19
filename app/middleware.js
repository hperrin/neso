import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getNymphInstance,
  ADDRESS,
  PORT,
  WSADDRESS,
  WSPORT,
} from './build/nymph/nymph.js';

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
};
