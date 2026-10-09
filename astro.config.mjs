// @ts-check
import { defineConfig } from 'astro/config';
import { checkVideoSize, pruneUnusedImages } from './integrations/media.mjs';

// https://astro.build/config
export default defineConfig({
  // Used for absolute URLs in link previews. Set SITE_URL when deploying to the real address.
  site: process.env.SITE_URL ?? 'https://memorable.pages.dev',
  integrations: [checkVideoSize, pruneUnusedImages],
});
