export const heroFrames = Object.entries(
  import.meta.glob("../../frames/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

export const maxFrameIndex = Math.max(heroFrames.length - 1, 0);

const preloadedFrames = new Map();
const frameImageCache = new Map();

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

export function preloadAllFrames(onProgress) {
  let loaded = 0;
  const total = heroFrames.length;
  const CONCURRENCY = 8;

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