import { Entity } from '@nymphjs/client';

import type { Project, ProjectData } from './Project';

export type TodoData = {
  text: string;
  done: boolean;
  project: Project & ProjectData;
};

export class Todo extends Entity<TodoData> {
  // The name of the server class
  public static class = 'Todo';

  constructor(guid?: string) {
    super(guid);

    if (guid == null) {
      this.$data.text = '';
      this.$data.done = false;
    }
  }

  static async factory(guid?: string): Promise<Todo & TodoData> {
    return (await super.factory(guid)) as Todo & TodoData;
  }

  static factorySync(guid?: string): Todo & TodoData {
    return super.factorySync(guid) as Todo & TodoData;
  }
}
