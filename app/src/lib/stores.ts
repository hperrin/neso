import type { ClientConfig, CurrentUserData } from '@nymphjs/tilmeld-client';
import type { PubSubSubscription } from '@nymphjs/client';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type {
  SessionStuff,
  UserClass,
  SettingsClass,
  SettingsData,
  SocialObjectClass,
  SocialObjectData,
} from '$lib/nymph.js';

export type Stores = {
  readyPromise: Writable<Promise<void>>;
  readonly readyPromiseResolve: () => void;
  readonly readyPromiseReject: (reason?: any) => void;
  user: Writable<(UserClass & CurrentUserData) | null | undefined>;
  clientConfig: Writable<ClientConfig>;
  settingsReadyPromise: Writable<Promise<void>>;
  settings: Writable<SettingsClass & SettingsData>;
  userAvatar: Writable<string>;
  tilmeldAdmin: Writable<boolean | undefined>;
  systemAdmin: Writable<boolean | undefined>;
  search: Writable<string>;
  inReplyTo: Writable<(SocialObjectClass & SocialObjectData) | undefined>;
  loading: Writable<boolean>;
  smallWindow: Writable<boolean>;
  miniWindow: Writable<boolean>;
  drawerOpen: Writable<boolean>;
};

export default function stores(
  stuff: Pick<SessionStuff, 'pubsub' | 'Settings'>
): Stores {
  const { pubsub, Settings } = stuff;

  let readyPromiseResolve: () => void;
  let readyPromiseReject: (reason?: any) => void;
  const readyPromise = writable<Promise<void>>(
    new Promise<void>((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    })
  );
  const user = writable<(UserClass & CurrentUserData) | null | undefined>(
    undefined
  );
  const clientConfig = writable<ClientConfig>({
    // Default values should be the most restrictive.
    allowRegistration: false,
    allowUsernameChange: false,
    emailUsernames: false,
    pwRecovery: false,
    regFields: [],
    unverifiedAccess: false,
    userFields: [],
    verifyEmail: false,
  });

  let settingsReadyPromiseResolve: () => void;
  let settingsReadyPromiseReject: (reason?: any) => void;
  const settingsReadyPromise = writable<Promise<void>>(
    new Promise<void>((resolve, reject) => {
      settingsReadyPromiseResolve = resolve;
      settingsReadyPromiseReject = reject;
    })
  );
  const settings = writable<SettingsClass & SettingsData>(
    Settings.factorySync()
  );

  const userAvatar = writable<string>('');
  const tilmeldAdmin = writable<boolean | undefined>(undefined);
  const systemAdmin = writable<boolean | undefined>(undefined);

  // Social Related

  const search = writable<string>('');
  const inReplyTo = writable<
    (SocialObjectClass & SocialObjectData) | undefined
  >();

  // Global

  const loading = writable<boolean>(false);
  const smallWindow = writable<boolean>(false);
  const miniWindow = writable<boolean>(false);
  const drawerOpen = writable<boolean>(false);

  let previousUser: (UserClass & CurrentUserData) | null | undefined =
    undefined;
  let userSubscription: PubSubSubscription<UserClass & CurrentUserData> | null =
    null;
  let firstStart = true;
  user.subscribe((userValue) => {
    if (userValue && !userValue.$is(previousUser)) {
      settingsReadyPromise.set(
        new Promise<void>((resolve, reject) => {
          settingsReadyPromiseResolve = resolve;
          settingsReadyPromiseReject = reject;
        })
      );

      Settings.current().then((currentSettings) => {
        settings.set(currentSettings);
        settingsReadyPromiseResolve();
      }, settingsReadyPromiseReject);

      if (userSubscription) {
        userSubscription.unsubscribe();
      }
      userSubscription = pubsub.subscribeWith(userValue, (updatedUser) => {
        // Update the store to notify and re-render the Svelte components.
        user.set(updatedUser);
      });

      userValue
        .$gatekeeper('tilmeld/admin')
        .then((value) => tilmeldAdmin.set(value));
      userValue
        .$gatekeeper('system/admin')
        .then((value) => systemAdmin.set(value));

      userValue.$getAvatar().then((value) => {
        userAvatar.set(value);
      });
    } else if (!userValue && (previousUser || firstStart)) {
      settingsReadyPromise.set(
        new Promise<void>((resolve, reject) => {
          settingsReadyPromiseResolve = resolve;
          settingsReadyPromiseReject = reject;
        })
      );

      tilmeldAdmin.set(undefined);
      systemAdmin.set(undefined);
      userAvatar.set('');

      if (userSubscription) {
        userSubscription.unsubscribe();
        userSubscription = null;
      }

      settings.set(Settings.factorySync());
      search.set('');
      inReplyTo.set(undefined);

      settingsReadyPromiseResolve();

      // As a last resort for the bug where logging out then logging in causes
      // strange issues, refresh the page on log out.
      if (!firstStart && typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    firstStart = false;
    previousUser = userValue;
  });

  return {
    readyPromise,
    get readyPromiseResolve() {
      return readyPromiseResolve;
    },
    get readyPromiseReject() {
      return readyPromiseReject;
    },
    user,
    clientConfig,
    settingsReadyPromise,
    settings,
    userAvatar,
    tilmeldAdmin,
    systemAdmin,
    search,
    inReplyTo,
    loading,
    smallWindow,
    miniWindow,
    drawerOpen,
  };
}
