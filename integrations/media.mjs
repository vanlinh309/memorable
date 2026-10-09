import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Cloudflare Pages rejects any single file above 25 MiB.
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

/** Fails the build when a video is too big for Cloudflare Pages, before it is deployed. */
export const checkVideoSize = {
  name: 'check-video-size',
  hooks: {
    /** @param {{ logger: import('astro').AstroIntegrationLogger }} options */
    'astro:build:start': ({ logger }) => {
      const root = join(process.cwd(), 'src', 'content', 'events');
      const files = readdirSync(root, { recursive: true, encoding: 'utf8' });
      const tooBig = files
        .filter((f) => VIDEO_EXTENSIONS.includes(extname(f).toLowerCase()))
        .map((f) => ({ file: f, bytes: statSync(join(root, f)).size }))
        .filter(({ bytes }) => bytes > MAX_VIDEO_BYTES);
      if (tooBig.length > 0) {
        const list = tooBig.map(({ file, bytes }) => `${file} (${Math.round(bytes / 1048576)} MB)`).join(', ');
        throw new Error(`Videos over 25 MB can't be deployed to Cloudflare Pages. Compress: ${list}`);
      }
      logger.info('All videos are under 25 MB');
    },
  },
};

/**
 * Astro emits the full-size original of every imported photo next to the optimized
 * WebP variants. Nothing links to them, so drop any image the output doesn't reference.
 */
export const pruneUnusedImages = {
  name: 'prune-unused-images',
  hooks: {
    /** @param {{ dir: URL }} options */
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const files = readdirSync(root, { recursive: true, encoding: 'utf8' }).map((f) => join(root, f));
      const text = files
        .filter((f) => ['.html', '.js', '.css'].includes(extname(f)))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n');
      for (const file of files) {
        const name = file.split(/[\\/]/).pop() ?? '';
        if (/\.(jpe?g|png|webp)$/i.test(name) && file.includes('_astro') && !text.includes(name)) {
          rmSync(file);
        }
      }
    },
  },
};
