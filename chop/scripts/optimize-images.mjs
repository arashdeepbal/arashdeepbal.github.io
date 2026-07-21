/**
 * Encode `public/*.png` illustrations as WebP (resize + compress).
 * Drop new PNG exports into `public/`, run `npm run optimize:images`, then point components at `.webp`.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");
const files = (await readdir(publicDir)).filter((f) => f.endsWith(".png"));

if (files.length === 0) {
  console.log("No PNG files in public/ — nothing to do.");
  process.exit(0);
}

for (const name of files) {
  const input = path.join(publicDir, name);
  const outName = name.replace(/\.png$/i, ".webp");
  const output = path.join(publicDir, outName);

  const meta = await sharp(input).metadata();
  const w = meta.width ?? 0;

  // On-screen art is ≤256px (hero) or 180px (empty states); cap raster size for bandwidth.
  const maxW = name.includes("landing-hero") ? 512 : 400;
  let pipeline = sharp(input);
  if (w > maxW) {
    pipeline = pipeline.resize(maxW, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await pipeline
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(output);

  const inStat = await stat(input);
  const outStat = await stat(output);
  console.log(
    `${name} (${Math.round(inStat.size / 1024)}KB) → ${outName} (${Math.round(outStat.size / 1024)}KB)`
  );
}
