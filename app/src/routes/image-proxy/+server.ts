import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

/**
 * Proxy remote image requests to hide users' IP addresses and browser info.
 */
export const GET = (async ({ url, request }) => {
  try {
    const href = url.searchParams.get('href');

    if (href == null) {
      throw error(400, 'Bad request.');
    }

    const urlDecoded = new URL(href);

    if (
      ['http:', 'https:', 'ftp:'].indexOf(urlDecoded.protocol) === -1 ||
      urlDecoded.hostname === '127.0.0.1' ||
      urlDecoded.hostname === 'localhost' ||
      urlDecoded.hostname === (process.env.DOMAIN ?? '127.0.0.1')
    ) {
      throw error(403, 'Forbidden for your safety.');
    }

    const ifNoneMatch = request.headers.get('If-None-Match');
    const ifModifiedSince = request.headers.get('If-Modified-Since');

    const response = await fetch(href, {
      headers: {
        ...(ifNoneMatch
          ? {
              'If-None-Match': ifNoneMatch,
            }
          : {}),
        ...(ifModifiedSince
          ? {
              'If-Modified-Since': ifModifiedSince,
            }
          : {}),
      },
    });

    const contentType = response.headers.get('Content-Type') || 'text/plain';
    const contentLength = response.headers.get('Content-Length');
    const pragma = response.headers.get('Pragma');
    const cacheControl = response.headers.get('Cache-Control');
    const etag = response.headers.get('ETag');
    const lastModified = response.headers.get('Last-Modified');

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl ?? 'private, max-age=31536000, immutable',
        ...(contentLength
          ? {
              'Content-Length': contentLength,
            }
          : {}),
        ...(pragma
          ? {
              Pragma: pragma,
            }
          : {}),
        ...(etag
          ? {
              ETag: etag,
            }
          : {}),
        ...(lastModified
          ? {
              'Last-Modified': lastModified,
            }
          : {}),
      },
    });
  } catch (e: any) {
    throw error(500, 'Internal server error.');
  }
}) satisfies RequestHandler;
