import type { RequestHandler } from './$types';

export const GET = (() => {
  return new Response(String('authorize'));
}) satisfies RequestHandler;

// import { error } from '@sveltejs/kit';
// import { buildSessionStuff } from '$lib/nymph';
// import { buildApex } from '$lib/apex';
// import type { RequestHandler } from './$types';

// export const GET = (async ({ params, request }) => {
//   const { actor } = params;

//   const cookie = request.headers.get('cookie');
//   const authCookiePattern = /(?:(?:^|.*;\s*)TILMELDAUTH\s*=\s*([^;]*).*$)/;
//   let token: string | undefined = undefined;
//   let xsrfToken: string | undefined = undefined;

//   try {
//     if (cookie && cookie.match(authCookiePattern)) {
//       token = cookie.replace(authCookiePattern, '$1');
//       const base64Url = token.split('.')[1] || '';
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const json =
//         typeof atob === 'undefined'
//           ? Buffer.from(base64, 'base64').toString('binary') // node
//           : atob(base64); // browser
//       const jwt = JSON.parse(json);
//       xsrfToken = jwt.xsrfToken;
//     }
//   } catch (e: any) {
//     token = undefined;
//     xsrfToken = undefined;
//   }

//   const { User } = buildSessionStuff(
//     (input, init) =>
//       fetch(input, {
//         ...init,
//         // include cookie so user is logged in
//         headers: { ...init?.headers, cookie: cookie || '' },
//       }),
//     {
//       token,
//       xsrfToken,
//     },
//     false,
//     process.env.DOMAIN ?? '127.0.0.1'
//   );

//   const user = await User.factoryUsername(actor);

//   if (user == null) {
//     throw error(404, 'Not found.');
//   }

//   return new Response(String(JSON.stringify(user)), {
//     headers: { 'Content-Type': 'application/json' },
//   });
// }) satisfies RequestHandler;
