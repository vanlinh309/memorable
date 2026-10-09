// @ts-check
import { defineConfig } from 'astro/config';
import { checkVideoSize, pruneUnusedImages } from './integrations/media.mjs';

// https://astro.build/config
export default defineConfig({
  // Used for absolute URLs in link previews. SITE_URL overrides it (e.g. for a custom domain).
  site: process.env.SITE_URL ?? 'https://memorable.linh309.workers.dev',
  integrations: [checkVideoSize, pruneUnusedImages],
});
