import { Entity, Selector, nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type SettingsData = {
  theme: 'system' | 'light' | 'dark';
  bar: 'primary' | 'secondary';
};

export class Settings extends Entity<SettingsData> {
  static ETYPE = 'settings';
  static class = 'Settings';

  protected $allowlistData = ['theme', 'bar'];
  protected $allowlistTags = [];

  static async factory(guid?: string): Promise<Settings & SettingsData> {
    return (await super.factory(guid)) as Settings & SettingsData;
  }

  static factorySync(guid?: string): Settings & SettingsData {
    return super.factorySync(guid) as Settings & SettingsData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.theme = 'system';
      this.$data.bar = 'primary';
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Check that there is no Settings entity for this user already.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof Settings,
        },
        ...(this.guid
          ? [
              {
                type: '&',
                '!guid': this.guid,
              } as Selector,
            ]
          : [])
      )
    ) {
      throw new HttpError('You already have a settings entity.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          theme: Joi.any().valid('system', 'light', 'dark').required(),
          bar: Joi.any().valid('primary', 'secondary').required(),
        }),
        'Invalid Settings: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    return await super.$save();
  }
}
