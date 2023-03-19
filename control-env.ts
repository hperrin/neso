import { config } from 'dotenv';
import fs from 'node:fs';

config();

try {
  if (process.env.MYSQL_CA_CERT_FILE && !process.env.MYSQL_CA_CERT) {
    process.env.MYSQL_CA_CERT = fs.readFileSync(
      process.env.MYSQL_CA_CERT_FILE,
      'utf8'
    );
  }
} catch (e: any) {
  // ignore errors
}

try {
  if (process.env.CERT_FILE && !process.env.CERT) {
    process.env.CERT = fs.readFileSync(process.env.CERT_FILE, 'utf8');
  }
} catch (e: any) {
  // ignore errors
}

try {
  if (process.env.KEY_FILE && !process.env.KEY) {
    process.env.KEY = fs.readFileSync(process.env.KEY_FILE, 'utf8');
  }
} catch (e: any) {
  // ignore errors
}

try {
  if (process.env.DH_PARAM_FILE && !process.env.DH_PARAM) {
    process.env.DH_PARAM = fs.readFileSync(process.env.DH_PARAM_FILE, 'utf8');
  }
} catch (e: any) {
  // ignore errors
}
