// Usage: npm run shrink-photos
// Shrinks every event photo in place to at most 2048 px and strips EXIF/GPS metadata,
// so the repo stays small and photos don't leak where they were taken.
import { readdirSync, renameSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import sharp from 'sharp';

const MAX_SIDE = 2048;
const eventsDir = join(process.cwd(), 'src', 'content', 'events');

const files = readdirSync(eventsDir, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.split(/[\\/]/).includes('photos'))
  .map((f) => join(eventsDir, f));

const unsupported = files.filter((f) => ['.heic', '.heif'].includes(extname(f).toLowerCase()));
for (const file of unsupported) {
  console.warn(`Skipped ${relative(process.cwd(), file)}: HEIC isn't supported, export it as JPG first.`);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let changed = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

  const meta = await sharp(file).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const hasMetadata = Boolean(meta.exif || meta.xmp || meta.iptc);
  if (longest <= MAX_SIDE && !hasMetadata) continue;

  const before = statSync(file).size;
  const image = sharp(file)
    .rotate() // bake in the EXIF orientation before the metadata is dropped
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true });
  const output =
    ext === '.png'
      ? image.png({ compressionLevel: 9 })
      : ext === '.webp'
        ? image.webp({ quality: 82 })
        : image.jpeg({ quality: 82, mozjpeg: true });

  const tmp = `${file}.tmp`;
  const info = await output.toFile(tmp);
  renameSync(tmp, file);
  changed++;
  console.log(
    `${relative(process.cwd(), file)}: ${meta.width}x${meta.height} ${kb(before)} -> ${info.width}x${info.height} ${kb(info.size)}`,
  );
}

console.log(changed === 0 ? 'All photos are already small and clean.' : `Shrank ${changed} photo(s).`);
