# Team memories

A colorful, mobile-first adventure map of our team events. Each event has a page with photos, a short clip, and a description. Static site built with [Astro](https://astro.build), no backend.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs ./dist
npm run preview  # serves the production build
```

Needs Node 22.12 or newer.

## Add an event

```sh
npm run new-event -- "Summer party" --date 2025-06-14 --icon 🎉 --tags party,fun
```

This creates `src/content/events/2025-06-14-summer-party/`:

```
event.md      title, date, color, icon, tags, optional Slack link, description
photos/       drop photos here (jpg, png or webp, any size)
clip.mp4      optional short video next to event.md (webm and mov work too)
```

Options: `--color` is one of red, purple, teal, amber, pink, blue (rotates if omitted). The first photo is used for the link preview in Slack, or set `cover:` in `event.md`.

Photos are resized and converted to WebP at build time, with blurred placeholders. The originals are never deployed. Videos are deployed as they are, so keep each under 25 MB (the build fails otherwise, because Cloudflare Pages rejects larger files).

## Features

- Adventure map timeline grouped by year
- Event page with swipe, pinch-zoom photo gallery and confetti
- Bottom bar: jump to a year, random memory, search
- "On this day" banner (preview any date with `/?today=2026-10-05`)
- Installable on a phone's home screen
- Link previews in Slack show the event's cover photo

## Deployment

Live at https://memorable.linh309.workers.dev, hosted as a Cloudflare Worker that serves static files only.

- Every push to `main` builds and deploys automatically (build command `npm run build`, deploy command `npx wrangler deploy`).
- `wrangler.jsonc` tells Cloudflare to upload `./dist` as plain files. Keep it: without it, Wrangler auto-adds a server adapter and the deploy fails.
- `.node-version` pins the Node version used for the build.
- The site address used in link previews is set in `astro.config.mjs`. If you move to a custom domain, update it there or set a `SITE_URL` build variable.

`public/_headers` already sends `noindex` and caching headers, and every page has a `noindex` meta tag, so search engines should not list the site. Anyone with the link can still open it.

## Privacy

The site is public. Before adding photos of colleagues, check that they are fine with it, and remove a person's photos when they ask. Use first names only.
