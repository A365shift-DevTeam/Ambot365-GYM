/**
 * Compress & resize scroll-scrub frames for production hosting.
 *
 * Input:  frames/*.webp (source masters, 1920×1080)
 * Output: public/frames/desktop/*.webp  — wide viewports
 *         public/frames/mobile/*.webp   — phones / tablets
 *         src/utils/frameManifest.json  — count + paths for the app
 *
 * Usage:  npm run optimize:frames
 *         npm run optimize:frames -- --force
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SRC_DIR = path.join(root, "frames");
const PUBLIC_DIR = path.join(root, "public", "frames");
const MANIFEST_PATH = path.join(root, "src", "utils", "frameManifest.json");

const VARIANTS = {
  desktop: {
    width: 1600,
    quality: 62,
    effort: 6,
    smartSubsample: true,
  },
  mobile: {
    width: 960,
    quality: 55,
    effort: 6,
    smartSubsample: true,
  },
};

const CONCURRENCY = 6;

function parseArgs(argv) {
  return {
    force: argv.includes("--force"),
  };
}

async function listSourceFrames() {
  const entries = await fs.readdir(SRC_DIR);
  return entries
    .filter((name) => /\.webp$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function mapPool(items, limit, worker) {
  let index = 0;
  let active = 0;
  const results = new Array(items.length);

  return new Promise((resolve, reject) => {
    const launch = () => {
      while (active < limit && index < items.length) {
        const current = index++;
        active++;
        Promise.resolve(worker(items[current], current))
          .then((value) => {
            results[current] = value;
            active--;
            if (index >= items.length && active === 0) resolve(results);
            else launch();
          })
          .catch(reject);
      }
    };
    if (items.length === 0) resolve(results);
    else launch();
  });
}

async function optimizeOne(srcName, variant, options) {
  const srcPath = path.join(SRC_DIR, srcName);
  const outDir = path.join(PUBLIC_DIR, variant);
  const outPath = path.join(outDir, srcName);

  const input = sharp(srcPath, { failOn: "none" });
  const meta = await input.metadata();

  let pipeline = sharp(srcPath, { failOn: "none" }).rotate();

  if (meta.width && meta.width > options.width) {
    pipeline = pipeline.resize({
      width: options.width,
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  await pipeline
    .webp({
      quality: options.quality,
      effort: options.effort,
      smartSubsample: options.smartSubsample,
    })
    .toFile(outPath);

  const stat = await fs.stat(outPath);
  return { name: srcName, bytes: stat.size };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const { force } = parseArgs(process.argv.slice(2));
  const sources = await listSourceFrames();

  if (sources.length === 0) {
    console.error(`No .webp frames found in ${SRC_DIR}`);
    process.exit(1);
  }

  // Skip rebuild when outputs already match source count (unless --force)
  if (!force) {
    try {
      const existing = await fs.readdir(path.join(PUBLIC_DIR, "desktop"));
      const webps = existing.filter((n) => n.endsWith(".webp"));
      if (webps.length === sources.length) {
        console.log(
          `public/frames already has ${webps.length} desktop frames. Pass --force to re-encode.`,
        );
        return;
      }
    } catch {
      // missing output dir — continue
    }
  }

  console.log(`Optimizing ${sources.length} source frames…`);

  for (const variant of Object.keys(VARIANTS)) {
    await ensureCleanDir(path.join(PUBLIC_DIR, variant));
  }

  const summary = {};

  for (const [variant, options] of Object.entries(VARIANTS)) {
    const started = Date.now();
    const results = await mapPool(sources, CONCURRENCY, (name) =>
      optimizeOne(name, variant, options),
    );
    const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
    summary[variant] = {
      count: results.length,
      bytes: totalBytes,
      avgBytes: Math.round(totalBytes / results.length),
      width: options.width,
      quality: options.quality,
      ms: Date.now() - started,
    };
    console.log(
      `  ${variant.padEnd(8)} ${results.length} frames → ${formatBytes(totalBytes)} ` +
        `(avg ${formatBytes(summary[variant].avgBytes)}, ${options.width}w q${options.quality}) ` +
        `in ${summary[variant].ms}ms`,
    );
  }

  const manifest = {
    count: sources.length,
    pad: 8,
    extension: "webp",
    variants: Object.fromEntries(
      Object.entries(summary).map(([name, info]) => [
        name,
        {
          path: `/frames/${name}`,
          count: info.count,
          width: info.width,
          quality: info.quality,
        },
      ]),
    ),
    files: sources,
    generatedAt: new Date().toISOString(),
  };

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(PUBLIC_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  const sourceBytes = (
    await mapPool(sources, CONCURRENCY, async (name) => {
      const s = await fs.stat(path.join(SRC_DIR, name));
      return s.size;
    })
  ).reduce((a, b) => a + b, 0);

  console.log("");
  console.log(`Source total:  ${formatBytes(sourceBytes)}`);
  console.log(`Desktop total: ${formatBytes(summary.desktop.bytes)} (${((1 - summary.desktop.bytes / sourceBytes) * 100).toFixed(0)}% smaller)`);
  console.log(`Mobile total:  ${formatBytes(summary.mobile.bytes)} (${((1 - summary.mobile.bytes / sourceBytes) * 100).toFixed(0)}% smaller)`);
  console.log(`Manifest → ${path.relative(root, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
