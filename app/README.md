# Oblag Web App

Federated social network implementing ActivityPub.

## Structure

This app has two parts.

- `server`: The server side of the Nymph entities and endpoints.
  Check out [Nymph.js](https://nymph.io) to learn how to modify this code. It is used through the /rest/ endpoint on the server.
  **Any time you make a change in here, you need to run `npm run build:server` and restart your dev server.**
- `src`: The SvelteKit app, along with the client side of the Nymph entities.
  Check out [SvelteKit](https://kit.svelte.dev/) and [SMUI](https://sveltematerialui.com/) to learn how to modify this app.

## Prereqs

```sh
# For local development (localhost).
npm i
npx svelte-kit sync
npm run build:server

npm run dev
```

```sh
# For dev servers (not localhost).
sudo openssl dhparam -out /etc/ssl/dh-example.com.pem 2048
sudo chmod go-rwx /etc/ssl/dh-example.com.pem
sudo certbot certonly --standalone --domains=example.com

npm run build

sudo env DEBUG=email-templates NODE_ENV="production" DOMAIN="example.com" JWT_SECRET="6002c271-157d-4a52-b8a3-b4cef645fb67" CERT="$(sudo cat /etc/letsencrypt/live/example.com/fullchain.pem)" KEY="$(sudo cat /etc/letsencrypt/live/example.com/privkey.pem)" DH_PARAM="$(sudo cat /etc/ssl/dh-example.com.pem)" PORT=443 REDIRECT_PORT=80 npm run devserver:start
```

## Production

In addition to the previously listed environment variables, you need to specify at least MYSQL_HOST and MYSQL_PASSWORD to work with a production MySQL server.

You should also run `npx uuid` to obtain a new, random JWT_SECRET. This secret is used for generating secure authentication tokens, so KEEP IT PRIVATE.

# Copyright

Copyright 2023 Hunter Perrin, Nick Antolos

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
