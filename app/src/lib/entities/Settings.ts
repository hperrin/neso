import { Entity } from '@nymphjs/client';

export type SettingsData = {
  theme: 'system' | 'light' | 'dark';
  bar: 'primary' | 'secondary';
};

export class Settings extends Entity<SettingsData> {
  // The name of the server class
  public static class = 'Settings';

  constructor(guid?: string) {
    super(guid);

    if (guid == null) {
      this.$data.theme = 'system';
      this.$data.bar = 'primary';
    }
  }

  static async factory(guid?: string): Promise<Settings & SettingsData> {
    return (await super.factory(guid)) as Settings & SettingsData;
  }

  static factorySync(guid?: string): Settings & SettingsData {
    return super.factorySync(guid) as Settings & SettingsData;
  }

  static async redoOnboarding(): Promise<boolean> {
    return await this.serverCallStatic('redoOnboarding', []);
  }

  static async uploadAvatar(base64Data: string): Promise<string> {
    return await this.serverCallStatic('uploadAvatar', [base64Data]);
  }

  static async current(): Promise<Settings & SettingsData> {
    try {
      const currentSettings = await this.nymph.getEntity({ class: Settings });

      if (currentSettings == null) {
        throw new Error("Settings shouldn't return null.");
      } else {
        return currentSettings;
      }
    } catch (e: any) {
      if (e.status === 404) {
        return this.factorySync();
      }
      throw e;
    }
  }

  // These are needed for Svelte SSR for some reason.
  get theme() {
    return this.$data.theme;
  }
  set theme(value: 'system' | 'light' | 'dark') {
    this.$data.theme = value;
  }
  get bar() {
    return this.$data.bar;
  }
  set bar(value: 'primary' | 'secondary') {
    this.$data.bar = value;
  }
}
