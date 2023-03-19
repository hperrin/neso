import { error } from '@sveltejs/kit';
import type { Nymph, EntityConstructor } from '@nymphjs/client';
import { queryParser } from '@nymphjs/query-parser';
import type { TodoClass } from '$lib/nymph';
import type { PageLoad } from './$types';

function parseTodoSearch<T extends EntityConstructor>(
  query: string,
  nymph: Nymph
) {
  const Todo = nymph.getEntityClass('Todo') as T;
  const Project = nymph.getEntityClass('Project') as T;

  // Filter done by default.
  if (!query.match(/(?:^| )\[!?done\](?:$| )/)) {
    query += ' [!done]';
  }

  // Limit to 25 todos by default.
  if (!query.match(/(?:^| )limit:\d+(?:$| )/)) {
    query += ' limit:25';
  }

  // Reverse by default.
  if (!query.match(/(?:^| )reverse:(?:true|false|1|0)(?:$| )/)) {
    query += ' reverse:true';
  }

  return queryParser({
    query,
    entityClass: Todo,
    defaultFields: ['text'],
    qrefMap: {
      Todo: {
        class: Todo,
        defaultFields: ['text'],
      },
      Project: {
        class: Project,
        defaultFields: ['name'],
      },
    },
  });
}

export const load: PageLoad = async ({ params, parent }) => {
  const { nymph, pubsub, stores } = await parent();
  const { search, searchResults } = stores;

  try {
    let searchQuery = params.query;
    search.set(searchQuery);

    const query = parseTodoSearch<typeof TodoClass>(searchQuery, nymph);
    const subscribable = pubsub.subscribeEntities(...query);

    searchResults.set(await nymph.getEntities(...query));

    return { subscribable };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};
