import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import helmet from 'helmet';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),

    csp: {
      mode: 'auto',
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Add sources for things like images, scripts, and fetch connections here.
        'img-src': ["'self'", 'data:', 'https://secure.gravatar.com'],
        'script-src': ["'self'"],
        'connect-src': [
          "'self'",
          // Change these to your actual domain.
          'wss://*.example.com',
          'wss://example.com',
          ...(process.env.NODE_ENV !== 'production'
            ? [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'ws://localhost:8080',
                'ws://127.0.0.1:8080',
              ]
            : []),
        ],
        'block-all-mixed-content': true,
        'upgrade-insecure-requests': true,
      },
    },
  },
};

export default config;
