<div>
  <slot />

  <div class="copyright mdc-typography--caption">
    Copyright &copy; 2023 Hunter Perrin, Nick Antolos. All rights reserved.
  </div>
</div>

<style>
  * :global(.bg-container) {
    position: relative;
  }

  * :global(.bg-container::before) {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(var(--mdc-theme-primary), transparent 100%);
    opacity: 0.1;
    z-index: 0;
  }

  * :global(.intro-container) {
    position: relative;
    padding: 240px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  * :global(.intro-container::before) {
    display: block;
    content: ' ';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url('/header.jpg');
    background-position: center 100%;
    background-size: cover;
    background-repeat: no-repeat;
    filter: blur(1px) saturate(65%);
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
  }

  * :global(.intro-container > *) {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1180px;
  }
  * :global(.intro-container > h1) {
    margin-top: 0;
    text-align: center;
  }
  * :global(.intro-container > p) {
    margin-bottom: 0;
  }

  * :global(.index-container) {
    position: relative;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 900px;
    margin: 0 auto;
    z-index: 1;
  }

  * :global(.index-container > *) {
    margin: 1em;
    flex-basis: 0;
    flex-grow: 1;
  }

  * :global(.index-container > * > *) {
    margin-bottom: 1em;
  }

  * :global(.big-points-container > h2) {
    margin-bottom: 5px;
  }

  * :global(.copyright) {
    text-align: center;
    padding-bottom: 2em;
  }

  @media (max-width: 1200px) {
    * :global(.intro-container) {
      padding: 140px 24px;
    }

    * :global(.intro-container > *) {
      max-width: 900px;
    }

    * :global(.index-container) {
      max-width: 740px;
    }
  }

  @media (max-width: 920px) {
    * :global(.intro-container) {
      padding: 84px 24px;
    }

    * :global(.intro-container > *) {
      max-width: 720px;
    }

    * :global(h1) {
      font-size: 4rem;
    }

    * :global(h2) {
      font-size: 2rem;
    }

    * :global(.index-container) {
      max-width: 600px;
    }
  }

  @media (max-width: 480px) {
    * :global(.intro-container) {
      padding: 24px 12px;
    }

    * :global(h1) {
      font-size: 2rem;
    }

    * :global(h2) {
      font-size: 1.5rem;
    }
  }
</style>
