import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ cookies, route }) => {
  if (route.id == null) {
    throw error(404, 'Not found.');
  }

  const authCookie = cookies.get('TILMELDAUTH');
  let tokens: { xsrfToken?: string; token?: string } = {};

  if (authCookie) {
    tokens.token = authCookie;

    try {
      const base64Url = tokens.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json =
        typeof atob === 'undefined'
          ? Buffer.from(base64, 'base64').toString('binary') // node
          : atob(base64); // browser
      const jwt = JSON.parse(json);

      tokens.xsrfToken = jwt.xsrfToken;
    } catch (e: any) {
      tokens = {};
    }
  }

  const PORT = Number(env.PORT ?? env.PROD_PORT ?? 5173);
  const DOMAIN = env.DOMAIN ?? '127.0.0.1';
  const PROTO = env.CERT || PORT === 443 ? 'https' : 'http';

  return {
    tokens,
    DOMAIN,
    PORT,
    PROTO,
    SECURE: PROTO === 'https' ? 'true' : 'false',
  };
};
