// import { createHash } from 'node:crypto';
// import { error } from '@sveltejs/kit';
// import type { PageLoad } from './$types';
// import { JWT_SECRET } from '$env/static/private';

// export const load: PageLoad = async ({ parent, url }) => {
//   const data = await parent();

//   console.log(data);

//   const { nymph, AuthClient } = data;

//   console.log({ secret: JWT_SECRET });

//   if (!url.searchParams.has('client_id')) {
//     throw error(400, 'Missing client id.');
//   }

//   const client_id = url.searchParams.get('client_id');

//   try {
//     const client = await nymph.getEntity(
//       { class: AuthClient },
//       { type: '&', equal: ['id', client_id] }
//     );

//     if (client == null) {
//       throw error(404, 'Client not found.');
//     }

//     return {
//       secretToken: createHash('sha256').update(
//         `${client.secret}_${JWT_SECRET}`
//       ),
//     };
//   } catch (e: any) {
//     throw error(e?.status ?? 500, e.message);
//   }
// };
