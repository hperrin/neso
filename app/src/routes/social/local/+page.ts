import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { ADDRESS, nymph, SocialActor, SocialActivity } = await parent();

  try {
    const activities = await nymph.getEntities(
      {
        class: SocialActivity,
        limit: 20,
        reverse: true,
      },
      {
        type: '|',
        match: ['actor', `^${ADDRESS}/users/`],
        qref: [
          'actor',
          [
            { class: SocialActor },
            { type: '&', match: ['id', `^${ADDRESS}/users/`] },
          ],
        ],
      }
    );

    return { activities };
  } catch (e: any) {
    throw error(e?.status ?? 500, e.message);
  }
};

// let afterEntry = after ? await this.SocialActivity.factoryId(after) : null;
// if (afterEntry && afterEntry.guid == null) {
//   throw new Error("Couldn't find last activity.");
// }

// const entries = await this.nymph.getEntities(
//   {
//     class: this.SocialActivity,
//     sort: 'cdate',
//     reverse: true,
//     ...(limit != null ? { limit } : {}),
//   },
//   {
//     type: '&',
//     contain: ['_meta', collectionId],
//     ...(afterEntry != null && afterEntry.guid != null
//       ? {
//           lte: ['cdate', afterEntry.cdate || 0],
//           '!guid': afterEntry.guid,
//         }
//       : {}),
//   },
//   ...(blockList?.length
//     ? [
//         {
//           type: '!&',
//           equal: blockList.map(
//             (actor) => ['actor', actor] as [string, string]
//           ),
//           contain: blockList.map(
//             (actor) => ['actor', actor] as [string, string]
//           ),
//           qref: blockList.map(
//             (actor) =>
//               [
//                 'actor',
//                 [
//                   { class: this.SocialActor },
//                   {
//                     type: '&',
//                     equal: ['id', actor],
//                   },
//                 ],
//               ] as [string, [Options, ...Selector[]]]
//           ),
//         } as Selector,
//       ]
//     : [])
// );

// return (await Promise.all(
//   entries.map(
//     async (e) =>
//       await this.apex.fromJSONLD(await e.entry.$toAPObject(false))
//   )
// )) as APEXActivity[];
