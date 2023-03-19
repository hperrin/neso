import type { User, UserData } from '@nymphjs/tilmeld';

import type { Project as ProjectClass } from '../entities/Project.js';
import type { Todo as TodoClass } from '../entities/Todo.js';

export default async function handleOnboarding(user: User & UserData) {
  const nymph = user.$nymph.clone();

  const Project = nymph.getEntityClass('Project') as typeof ProjectClass;
  const Todo = nymph.getEntityClass('Todo') as typeof TodoClass;

  // Create a new Project.
  let project = Project.factorySync();
  project.name = 'My Tasks';
  project.done = false;
  await project.$save();

  let projectImportant = Project.factorySync();
  projectImportant.name = 'Important';
  projectImportant.done = false;
  projectImportant.parent = project;
  await projectImportant.$save();

  let projectOngoing = Project.factorySync();
  projectOngoing.name = 'Ongoing';
  projectOngoing.done = false;
  projectOngoing.parent = project;
  await projectOngoing.$save();

  let todoImportant = Todo.factorySync();
  todoImportant.text = 'Build an awesome social network app with SvelteKit!';
  todoImportant.done = false;
  todoImportant.project = projectImportant;
  await todoImportant.$save();

  let todoOngoing = Todo.factorySync();
  todoOngoing.text = 'Be awesome!';
  todoOngoing.done = false;
  todoOngoing.project = projectOngoing;
  await todoOngoing.$save();
}
