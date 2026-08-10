import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getClosestLoadedImage,
  getLoadedImage,
  heroFrames,
  maxFrameIndex,
  preloadFrame,
  resolveVariant,
  setFrameVariant,
} from "../utils/heroFrames";

export default function HeroSection({ children }) {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const stackRef = useRef(null);
  const animFrameId = useRef(null);
  const currentFrameProgress = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileScrollDistance, setMobileScrollDistance] = useState(0);

  const { scrollY, scrollYProgress } = useScroll();

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motionMedia.matches);
    updateMotion();
    motionMedia.addEventListener("change", updateMotion);

    const mobileMedia = window.matchMedia("(max-width: 991px)");
    const updateMobile = () => setIsMobile(mobileMedia.matches);
    updateMobile();
    mobileMedia.addEventListener("change", updateMobile);

    const updateDist = () => setMobileScrollDistance(window.innerHeight * 4);
    updateDist();
    window.addEventListener("resize", updateDist);

    return () => {
      motionMedia.removeEventListener("change", updateMotion);
      mobileMedia.removeEventListener("change", updateMobile);
      window.removeEventListener("resize", updateDist);
    };
  }, []);

  const drawFrame = useCallback((frameProgress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const latest = Math.min(maxFrameIndex, Math.max(0, frameProgress * maxFrameIndex));
    const baseIndex = Math.floor(latest);
    const overlayIndex = Math.min(maxFrameIndex, Math.ceil(latest));
    const alpha = latest - baseIndex;

    const baseImg = getLoadedImage(heroFrames[baseIndex]) || getClosestLoadedImage(baseIndex);
    const overlayImg = alpha > 0.01 ? (getLoadedImage(heroFrames[overlayIndex]) || getClosestLoadedImage(overlayIndex)) : null;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    // Match CSS object-position: keep head/hands (top of frame) visible.
    // posX/posY are 0–1 like object-position percentages (0.5 = center, 0 = top/left).
    let posX = 0.5;
    let posY = 0; // desktop default: center top
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w <= 680) {
        posX = 0.5;
        posY = 0.14;
      } else if (w <= 820) {
        posX = 0.52;
        posY = 0.1;
      } else if (w <= 1050) {
        posX = 0.5;
        posY = 0.08;
      } else if (w >= 1440) {
        posX = 0.5;
        posY = 0.12;
      }
      if (h <= 520 && w > h) {
        posY = 0.2;
      }
    }

    const renderCover = (img, opacity = 1) => {
      if (!img || !img.naturalWidth) return;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgRatio = imgW / imgH;
      const canvasRatio = width / height;

      let rW;
      let rH;
      let x;
      let y;

      // object-fit: cover + object-position
      if (canvasRatio > imgRatio) {
        // Canvas is wider → fill width, crop top/bottom
        rW = width;
        rH = width / imgRatio;
        x = 0;
        y = (height - rH) * posY;
      } else {
        // Canvas is taller → fill height, crop sides
        rH = height;
        rW = height * imgRatio;
        y = 0;
        x = (width - rW) * posX;
      }

      if (opacity < 1) {
        ctx.globalAlpha = opacity;
      }
      ctx.drawImage(img, x, y, rW, rH);
      if (opacity < 1) {
        ctx.globalAlpha = 1;
      }
    };

    if (baseImg) {
      renderCover(baseImg, 1);
    }
    if (overlayImg && overlayImg !== baseImg && alpha > 0.01) {
      renderCover(overlayImg, alpha);
    }

    // Preload buffer ahead and behind for uninterrupted scrubbing
    const ahead = Math.min(maxFrameIndex, baseIndex + 25);
    const behind = Math.max(0, baseIndex - 20);
    for (let i = baseIndex + 1; i <= ahead; i++) {
      preloadFrame(heroFrames[i]);
    }
    for (let i = baseIndex - 1; i >= behind; i--) {
      preloadFrame(heroFrames[i]);
    }
  }, []);

  const renderLoop = useCallback(() => {
    drawFrame(currentFrameProgress.current);

    if (stackRef.current) {
      const scale = reducedMotion ? 1 : 1 + currentFrameProgress.current * 0.08;
      stackRef.current.style.transform = `scale(${scale})`;
    }
  }, [drawFrame, reducedMotion]);

  // Keep desktop/mobile frame sets in sync with viewport
  useEffect(() => {
    setFrameVariant(resolveVariant(isMobile));
    const initial = Math.min(40, heroFrames.length);
    heroFrames.slice(0, initial).forEach((src, i) => {
      setTimeout(() => preloadFrame(src), i * 4);
    });
    renderLoop();
  }, [isMobile, renderLoop]);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (heroFrames.length <= 1) return;

    let progress = 0;

    if (trackRef.current && stickyRef.current) {
      if (isMobile) {
        const maxScroll = mobileScrollDistance || window.innerHeight * 4;
        progress = Math.min(Math.max(y / maxScroll, 0), 1);
      } else {
        const rect = trackRef.current.getBoundingClientRect();
        const scrolled = -rect.top;
        const stickyHeight = stickyRef.current.offsetHeight;
        const stickyOffsetTop = stickyRef.current.offsetTop;
        const scrollDistance = Math.max(rect.height - stickyHeight - stickyOffsetTop, 1);
        progress = Math.min(Math.max(scrolled / scrollDistance, 0), 1);
      }
    }

    currentFrameProgress.current = progress;

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(() => {
        animFrameId.current = null;
        renderLoop();
      });
    }
  });

  useEffect(() => {
    renderLoop();
    const handleResize = () => renderLoop();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [renderLoop]);

  return (
    <section className={`hero-section${reducedMotion ? " hero-reduced-motion" : ""}`}>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div id="home" className="hero-scroll-track" ref={trackRef}>
        <div className="hero-sticky-wrapper" ref={stickyRef}>
          <div className="hero-canvas-wrapper">
            <div className="hero-frame-stack" ref={stackRef}>
              <canvas
                ref={canvasRef}
                className="hero-frame-image"
                aria-label="Athlete training inside Ambot365 Gym"
                role="img"
              />
            </div>
          </div>
          {isMobile && <div className="hero-next-section">{children}</div>}
        </div>
        {isMobile && mobileScrollDistance > 0 && (
          <div style={{ height: `${mobileScrollDistance}px` }} />
        )}
      </div>
      {!isMobile && <div className="hero-next-section">{children}</div>}
    </section>
  );
}