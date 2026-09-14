/**
 * Upload the optimized scroll-scrub frames to Cloudinary.
 *
 * Input:  public/frames/{desktop,mobile}/*.webp  (run optimize:frames first)
 * Output: Cloudinary public IDs  fitness-factory/frames/<variant>/<name>
 *
 * Public IDs are set explicitly so delivery URLs are deterministic
 * regardless of the account's folder mode (see src/utils/heroFrames.js).
 *
 * Usage:  npm run upload:frames
 *         npm run upload:frames -- --force   (re-upload existing frames)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const PUBLIC_DIR = path.join(root, "public", "frames");
const CLOUD_FOLDER = "fitness-factory/frames";
const VARIANTS = ["desktop", "mobile"];
const CONCURRENCY = 6;

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  // fall back to variables already in the environment
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

/** public_id → asset_folder for everything already uploaded under prefix */
async function existingAssets(prefix) {
  const ids = new Map();
  let nextCursor;
  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    res.resources.forEach((r) => ids.set(r.public_id, r.asset_folder ?? ""));
    nextCursor = res.next_cursor;
  } while (nextCursor);
  return ids;
}

async function uploadOne(filePath, publicId, assetFolder, attempt = 1) {
  try {
    return await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      asset_folder: assetFolder,
      resource_type: "image",
      overwrite: true,
      invalidate: true,
      unique_filename: false,
      use_filename: false,
    });
  } catch (err) {
    if (attempt >= 3) throw err;
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return uploadOne(filePath, publicId, assetFolder, attempt + 1);
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const jobs = [];

  for (const variant of VARIANTS) {
    const dir = path.join(PUBLIC_DIR, variant);
    const names = (await fs.readdir(dir))
      .filter((n) => n.endsWith(".webp"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const name of names) {
      jobs.push({
        filePath: path.join(dir, name),
        publicId: `${CLOUD_FOLDER}/${variant}/${path.parse(name).name}`,
        assetFolder: `${CLOUD_FOLDER}/${variant}`,
      });
    }
  }

  // Dynamic-folder accounts ignore slashes in public_id for the Media Library,
  // so create the folders explicitly and upload with asset_folder.
  for (const variant of VARIANTS) {
    await cloudinary.api.create_folder(`${CLOUD_FOLDER}/${variant}`);
  }

  if (jobs.length === 0) {
    console.error("No frames in public/frames. Run `npm run optimize:frames` first.");
    process.exit(1);
  }

  const existing = force ? new Map() : await existingAssets(`${CLOUD_FOLDER}/`);
  const pending = jobs.filter((j) => existing.get(j.publicId) !== j.assetFolder);

  console.log(
    `Cloud "${CLOUDINARY_CLOUD_NAME}": ${jobs.length} frames, ${jobs.length - pending.length} already uploaded, ${pending.length} to upload.`,
  );

  let done = 0;
  const failures = [];
  await mapPool(pending, CONCURRENCY, async (job) => {
    try {
      await uploadOne(job.filePath, job.publicId, job.assetFolder);
    } catch (err) {
      failures.push({ ...job, error: err?.error?.message || err?.message || String(err) });
    }
    done++;
    if (done % 20 === 0 || done === pending.length) {
      console.log(`  ${done}/${pending.length}`);
    }
  });

  if (failures.length) {
    console.error(`\n${failures.length} upload(s) failed:`);
    failures.forEach((f) => console.error(`  ${f.publicId}: ${f.error}`));
    process.exit(1);
  }

  const sample = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUD_FOLDER}/desktop/00000001.webp`;
  console.log(`\nDone. Sample URL: ${sample}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
