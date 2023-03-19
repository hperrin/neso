import { Entity } from '@nymphjs/client';

export type ProjectData = {
  name: string;
  done: boolean;

  // Parent project. (Can't be this project or any of its children.)
  parent?: Project & ProjectData;
};

export class Project extends Entity<ProjectData> {
  // The name of the server class
  public static class = 'Project';

  public $level = 0;

  constructor(guid?: string) {
    super(guid);

    if (guid == null) {
      this.$data.name = '';
      this.$data.done = false;
    }
  }

  static async factory(guid?: string): Promise<Project & ProjectData> {
    return (await super.factory(guid)) as Project & ProjectData;
  }

  static factorySync(guid?: string): Project & ProjectData {
    return super.factorySync(guid) as Project & ProjectData;
  }
}
