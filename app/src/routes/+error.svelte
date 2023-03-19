<div class="error-page">
  {#if !redirect}
    <h1 class="mdc-typography--headline3">
      {$page.status}: {$page.status in errorDescriptions
        ? errorDescriptions[$page.status]
        : 'Unknown Error'}
    </h1>
    <h2 class="mdc-typography--headline4">
      That's a {$page.status < 500 ? 'client' : 'server'} error.
    </h2>

    <p>{error.message}</p>
  {:else}
    <h1>Redirect</h1>
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const error = $page.error || {
    status: 500,
    message: 'Internal server error.',
  };
  const redirect =
    'status' in error &&
    error.status >= 300 &&
    error.status < 400 &&
    'location' in error;

  const errorDescriptions: { [k: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
  };

  onMount(() => {
    if (redirect && 'location' in error) {
      goto((error as { location: string }).location);
    }
  });
</script>

<style>
  .error-page {
    padding: 2em 4em;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
  }
</style>
