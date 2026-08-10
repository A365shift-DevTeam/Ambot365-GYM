import frameManifest from "./frameManifest.json";

const PAD = frameManifest.pad ?? 8;
const EXT = frameManifest.extension ?? "webp";
export const FRAME_COUNT = frameManifest.count ?? 0;
export const maxFrameIndex = Math.max(FRAME_COUNT - 1, 0);

const MOBILE_MQ = "(max-width: 991px)";

/** @type {"desktop" | "mobile"} */
let activeVariant = "desktop";

const preloadedFrames = new Map();
const frameImageCache = new Map();

export function padFrameIndex(index) {
  return String(index + 1).padStart(PAD, "0");
}

export function frameUrl(index, variant = activeVariant) {
  if (index < 0 || index >= FRAME_COUNT) return null;
  return `/frames/${variant}/${padFrameIndex(index)}.${EXT}`;
}

export function buildFrameList(variant = activeVariant) {
  if (FRAME_COUNT <= 0) return [];
  return Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(i, variant));
}

export function resolveVariant(isMobile) {
  if (typeof isMobile === "boolean") {
    return isMobile ? "mobile" : "desktop";
  }
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia(MOBILE_MQ).matches ? "mobile" : "desktop";
}

/**
 * Switch desktop/mobile frame sets. Returns true when the list changed.
 * Cache entries are keyed by URL, so both variants can coexist in memory.
 */
export function setFrameVariant(variant) {
  const next = variant === "mobile" ? "mobile" : "desktop";
  if (next === activeVariant && heroFrames.length === FRAME_COUNT) {
    return false;
  }
  activeVariant = next;
  heroFrames = buildFrameList(next);
  return true;
}

export function getActiveVariant() {
  return activeVariant;
}

/** Live list for the active viewport variant (mutated by setFrameVariant). */
export let heroFrames = buildFrameList(
  typeof window !== "undefined" ? resolveVariant() : "desktop",
);

if (typeof window !== "undefined") {
  activeVariant = resolveVariant();
  heroFrames = buildFrameList(activeVariant);
}

export function preloadFrame(src) {
  if (!src) return Promise.resolve(null);
  if (preloadedFrames.has(src)) return preloadedFrames.get(src);

  const promise = new Promise((resolve) => {
    const img = new Image();

    const onDone = () => {
      frameImageCache.set(src, img);
      if (img.decode) {
        img.decode().then(() => resolve(img)).catch(() => resolve(img));
      } else {
        resolve(img);
      }
    };

    img.src = src;

    if (img.complete && img.naturalWidth !== 0) {
      onDone();
    } else {
      img.onload = onDone;
      img.onerror = () => resolve(null);
    }
  });

  preloadedFrames.set(src, promise);
  return promise;
}

export function getLoadedImage(src) {
  return frameImageCache.get(src) || null;
}

export function getClosestLoadedImage(index) {
  if (heroFrames.length === 0) return null;
  const clampedIndex = Math.max(0, Math.min(maxFrameIndex, Math.round(index)));
  const targetSrc = heroFrames[clampedIndex];
  if (frameImageCache.has(targetSrc)) {
    return frameImageCache.get(targetSrc);
  }
  for (let offset = 1; offset <= maxFrameIndex; offset++) {
    const prevIndex = clampedIndex - offset;
    if (prevIndex >= 0 && frameImageCache.has(heroFrames[prevIndex])) {
      return frameImageCache.get(heroFrames[prevIndex]);
    }
    const nextIndex = clampedIndex + offset;
    if (nextIndex <= maxFrameIndex && frameImageCache.has(heroFrames[nextIndex])) {
      return frameImageCache.get(heroFrames[nextIndex]);
    }
  }
  return null;
}

/**
 * Preload every frame for the active variant (used by the intro loader).
 * Concurrency stays modest so mobile networks are not flooded.
 */
export function preloadAllFrames(onProgress) {
  let loaded = 0;
  const total = heroFrames.length;
  const CONCURRENCY = 6;

  if (total === 0) {
    onProgress?.(1, 0, 0);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let index = 0;

    function next() {
      if (loaded >= total) {
        resolve();
        return;
      }

      while (index < total && index - loaded < CONCURRENCY) {
        const currentIndex = index;
        const src = heroFrames[currentIndex];
        index++;

        preloadFrame(src).then(() => {
          loaded += 1;
          onProgress?.(loaded / total, loaded, total);
          next();
        });
      }
    }

    next();
  });
}
