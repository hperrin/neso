# Neso

Federated social network implementing ActivityPub.

This is a [Svelte Hackathon](https://hack.sveltesociety.dev/) project!

## Live Instance

Check it out live at [neso.social](https://neso.social/).

# Notes for Hackathon Reviewers

The main branch for the Hackathon submission is the [master branch](https://github.com/hperrin/neso/tree/master).

The live site will actually retrieve and receive data from federated instances and push data to federated instances, but a local version will only retrieve data from other instances since instances don't accept data from or push data to something identifying itself as "127.0.0.1".

## Things that Work

- Local feed.
- Global feed.
- Posting.
- Searching for people on all instances (try `@hperrin@port87.social` in the search bar).
- Searching for posts and activies from other instances (try something like `https://hachyderm.io/users/hildjj/statuses/110202067793729134`) in the search bar.
- Seeing posts/followers/following from people on other instances in their profile page. (It's quite slow the first time. Also, once its loaded, there's a bug that you won't see newer posts there anymore.)
- Following people on other instances.
- Liking posts.
- Boosting posts.
- Replying to posts.
- Viewing the replies on posts from other instance.
- OAuth (you can log in from other clients).
- WebFinger (people on other servers can find you with your @username@neso.social address).
- ActivityPub (most of ActivityPub works, so you should be able to see people and posts from **Mastodon**, **Pleroma**, **PixelFed**, **PeerTube**, and **Friendica**).

## Things that don't work.

- Home feed. (Technically it does work, but receiving a publish to your inbox from another instance is buggy and almost never works because of JSONLD issues. Also receiving from the same instance doesn't work because mentions don't work. Another instance of Neso should work though.)
- Mentions.
- Hashtags.
- Seeing images attached to posts.
- Seeing posts/followers/following from people on the same instance on their profile page.
- The posts being sorted correctly on the global feed. (They show what was added to the database most recently instead of what was published most recently.)
- The indicators for whether you have liked a post, boosted a post, or followed someone.
- Logging in from a Mastodon client (the Mastodon API is only partially done, and there are no clients that use just the ActivityPub spec.)
- Blocking users (not implemented, but the button is there).
- Viewing the replies on posts from the same isntance (local posts are missing the replies collection).
- Changing your name in the settings doesn't change your name on your ActivityPub profile.

# Now back to the readme

## Structure

This repository contains two separate parts.

- `app`: The main web/server app.
  This app uses, [Apex](https://www.npmjs.com/package/activitypub-express), [Nymph.js](https://nymph.io), [SMUI](https://sveltematerialui.com/), and [SvelteKit](https://kit.svelte.dev/). It runs a server with a Nymph endpoint and a Nymph PubSub server. It serves the front end browser app.
- `commands`: The server utility commands.
  These commands are meant to be run on a live server and help you manage the data for the app.

All parts use [Nymph.js](https://nymph.io/) to handle data.

## Local Development

In development mode, Nymph is configured to use a SQLite3 database, `development.db` in the root folder.

Run these commands:

```
npm i
cd app
npm i
npm run dev
```

to run a local dev server. It will then be available at http://127.0.0.1:5173/.

To get started, create a root user:

```
Username: root
Password: [whatever]
Name: Root
```

This user will be created with admin privileges and without any onboarding entities (first time setup). It will have access to the http://127.0.0.1:5173/user/ user admin app.

Now you can log out and create a regular user for testing. This user will not have admin privileges and will be onboarded.

~~When you create a regular user, the verification email will pop up in your browser. This is what happens in development mode instead of the email actually being sent.~~ Verification emails are turned off for simplicity. This will eventually change.

## Remote Development Server

```
# Install pm2
sudo npm i -g pm2

# Start the Managed Server
sudo pm2 start pm2.config.cjs --env development

# Restart the Servers (after a rebuild)
sudo pm2 restart all
```

## Production Server

```
# Install pm2
sudo npm i -g pm2

# Start the Managed Server
sudo pm2 start pm2.config.cjs --env production

# Save the process list and set to start up on system start.
sudo pm2 save
sudo pm2 startup systemd

# Restart the Servers (after a rebuild)
sudo pm2 restart all
```

## Prereqs

```sh
# You might need this on Ubuntu/Debian
sudo apt install nodejs npm
# Or this on Manjaro/Arch
sudo pamac install nodejs-lts-erbium

# Then get them all on the same version of node.
sudo npm i -g n
# You can use a higher version, but 16 is the minimum.
sudo n 16
sudo npm i -g npm@latest
```

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
