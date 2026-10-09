import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const events = defineCollection({
  loader: glob({
    base: './src/content/events',
    pattern: '*/event.md',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      color: z.enum(['red', 'purple', 'teal', 'amber', 'pink', 'blue']),
      icon: z.string().default('⭐'),
      tags: z.array(z.string()).default([]),
      slack: z.string().url().optional(),
      cover: image().optional(),
    }),
});

export const collections = { events };
