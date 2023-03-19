import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

import { Todo as TodoClass } from './Todo.js';

export type ProjectData = {
  name: string;
  done: boolean;

  // Parent project. (Can't be this project or any of its children.)
  parent?: Project & ProjectData;
};

export class Project extends Entity<ProjectData> {
  static ETYPE = 'project';
  static class = 'Project';

  protected $allowlistData = ['name', 'done', 'parent'];
  protected $allowlistTags = [];

  static async factory(guid?: string): Promise<Project & ProjectData> {
    return (await super.factory(guid)) as Project & ProjectData;
  }

  static factorySync(guid?: string): Project & ProjectData {
    return super.factorySync(guid) as Project & ProjectData;
  }

  constructor(guid?: string) {
    super(guid);

    if (this.guid == null) {
      this.$data.name = '';
      this.$data.done = false;
    }
  }

  async $save() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          name: Joi.string().max(256).trim(false).required(),
          done: Joi.boolean().required(),

          parent: Joi.object().instance(Project),
        }),
        'Invalid Project: '
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (this.$data.parent) {
      // Check that it's not recursive.
      let parent: (Project & ProjectData) | undefined = this.$data.parent;
      while (parent) {
        if (this.$is(parent)) {
          throw new HttpError("A project can't be nested under itself.", 400);
        }

        parent = parent.parent;
      }
    }

    return await super.$save();
  }

  async $delete() {
    const transaction = 'project-delete-' + this.guid;
    const nymph = this.$nymph;
    const tnymph = await nymph.startTransaction(transaction);
    this.$nymph = tnymph;

    try {
      // Remove it as parent from its children.
      const children = await tnymph.getEntities(
        { class: Project, skipAc: true },
        { type: '&', ref: ['parent', this] }
      );
      for (let child of children) {
        delete child.parent;
        if (!(await child.$save())) {
          await tnymph.rollback(transaction);
          return false;
        }
      }

      // Delete all the todos in this project.
      const Todo = tnymph.getEntityClass(TodoClass.class) as typeof TodoClass;
      const todos = await tnymph.getEntities(
        { class: Todo, skipAc: true },
        { type: '&', ref: ['project', this] }
      );
      for (let todo of todos) {
        if (!(await todo.$delete())) {
          await tnymph.rollback(transaction);
          return false;
        }
      }

      // Delete the project.
      const success = await super.$delete();
      if (success) {
        await tnymph.commit(transaction);
      } else {
        await tnymph.rollback(transaction);
      }
      this.$nymph = nymph;
      return success;
    } catch (e: any) {
      await tnymph.rollback(transaction);
      this.$nymph = nymph;
      throw e;
    }
  }
}
