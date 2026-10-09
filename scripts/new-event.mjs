// Usage: npm run new-event -- "Summer party" [--date 2025-06-14] [--icon 🎉] [--color teal] [--tags party,fun]
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const COLORS = ['red', 'purple', 'teal', 'amber', 'pink', 'blue'];
const eventsDir = join(process.cwd(), 'src', 'content', 'events');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    date: { type: 'string' },
    icon: { type: 'string' },
    color: { type: 'string' },
    tags: { type: 'string' },
  },
});

const title = positionals.join(' ').trim();
if (!title) {
  console.error('Give the event a title, e.g. npm run new-event -- "Summer party"');
  process.exit(1);
}

const date = values.date ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
  console.error(`Invalid date "${date}". Use YYYY-MM-DD.`);
  process.exit(1);
}

const color = values.color ?? COLORS[readdirSync(eventsDir).length % COLORS.length];
if (!COLORS.includes(color)) {
  console.error(`Invalid color "${color}". Pick one of: ${COLORS.join(', ')}.`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const folder = join(eventsDir, `${date}-${slug}`);
if (existsSync(folder)) {
  console.error(`${folder} already exists.`);
  process.exit(1);
}

const tags = (values.tags ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

mkdirSync(join(folder, 'photos'), { recursive: true });
writeFileSync(
  join(folder, 'event.md'),
  `---
title: ${JSON.stringify(title)}
date: ${date}
color: ${color}
icon: ${values.icon ?? '⭐'}
tags: [${tags.join(', ')}]
# slack: https://yourteam.slack.com/archives/...
# cover: ./photos/IMG_001.jpg   (optional, defaults to the first photo)
---

Write what happened here.
`,
);

console.log(`Created ${folder}
Next: drop photos in photos/ (and an optional clip.mp4 next to event.md), then edit event.md.`);
