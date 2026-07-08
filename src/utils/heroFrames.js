export const heroFrames = Object.entries(
  import.meta.glob("../../frames/*.jpg", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

export const maxFrameIndex = Math.max(heroFrames.length - 1, 0);

const preloadedFrames = new Set();

export function preloadFrame(src) {
  if (!src) return Promise.resolve();
  if (preloadedFrames.has(src)) return Promise.resolve();

  preloadedFrames.add(src);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export function preloadAllFrames(onProgress) {
  let loaded = 0;
  const total = heroFrames.length;

  return Promise.all(
    heroFrames.map((src) =>
      preloadFrame(src).then(() => {
        loaded += 1;
        onProgress?.(loaded / total, loaded, total);
      }),
    ),
  );
}