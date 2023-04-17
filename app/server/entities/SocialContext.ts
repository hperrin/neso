import type { Selector } from '@nymphjs/nymph';
import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';
import type { Context } from 'activitypub-express';
import Joi from 'joi';

export type SocialContextData = {
  contextUrl: string;
  documentUrl: string;
  document: any;
};

export class SocialContext extends Entity<SocialContextData> {
  static ETYPE = 'socialcontext';
  static class = 'SocialContext';

  static searchRestrictedData = ['contextUrl', 'documentUrl', 'document'];

  protected $privateData = ['contextUrl', 'documentUrl', 'document'];
  protected $allowlistData = [];
  protected $allowlistTags = [];

  private $skipAcWhenSaving = false;
  private $skipAcWhenDeleting = false;

  static async factory(
    guid?: string
  ): Promise<SocialContext & SocialContextData> {
    return (await super.factory(guid)) as SocialContext & SocialContextData;
  }

  static factorySync(guid?: string): SocialContext & SocialContextData {
    return super.factorySync(guid) as SocialContext & SocialContextData;
  }

  async $acceptJsonContext(obj: Context, fullReplace: boolean) {
    if (fullReplace) {
      for (const name in this.$data) {
        delete this.$data[name as keyof SocialContextData];
      }
    }

    if ('contextUrl' in obj) {
      this.$data.contextUrl = obj.contextUrl;
    }
    if ('documentUrl' in obj) {
      this.$data.documentUrl = obj.documentUrl;
    }
    if ('document' in obj) {
      this.$data.document = obj.document;
    }
  }

  async $toJsonContext(): Promise<Context> {
    return {
      contextUrl: this.$data.contextUrl,
      documentUrl: this.$data.documentUrl,
      document: this.$data.document,
    };
  }

  constructor(guid?: string) {
    super(guid);
  }

  async $save() {
    if (!this.$skipAcWhenSaving) {
      throw new HttpError('Only allowed by the server.', 403);
    }

    // Check that this context doesn't already exist.
    if (
      await this.$nymph.getEntity(
        {
          class: this.constructor as typeof SocialContext,
        },
        {
          type: '&',
          equal: ['documentUrl', this.$data.documentUrl],
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
      throw new HttpError('That context already exists.', 409);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,

          contextUrl: Joi.string().required(),
          documentUrl: Joi.string().required(),
          document: Joi.any().required(),
        }),
        'Invalid SocialContext: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    return await super.$save();
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $saveSkipAC() {
    this.$skipAcWhenSaving = true;
    return await this.$save();
  }

  public $tilmeldSaveSkipAC() {
    if (this.$skipAcWhenSaving) {
      this.$skipAcWhenSaving = false;
      return true;
    }
    return false;
  }

  async $delete() {
    if (!this.$skipAcWhenDeleting) {
      throw new HttpError('Only allowed by the server.', 403);
    }
    this.$skipAcWhenDeleting = false;

    return await super.$delete();
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $deleteSkipAC() {
    this.$skipAcWhenDeleting = true;
    return await this.$delete();
  }

  public $tilmeldDeleteSkipAC() {
    if (this.$skipAcWhenDeleting) {
      this.$skipAcWhenDeleting = false;
      return true;
    }
    return false;
  }
}
