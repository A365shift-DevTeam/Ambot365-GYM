import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const heroFrames = Object.entries(
  import.meta.glob("../../frames/*.jpg", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

const maxFrameIndex = Math.max(heroFrames.length - 1, 0);

function preloadFrame(src) {
  if (!src) return;
  const image = new Image();
  image.src = src;
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const baseImgRef = useRef(null);
  const overlayImgRef = useRef(null);
  const lastBaseIndex = useRef(-1);
  const lastOverlayIndex = useRef(-1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const frameProgress = useTransform(heroProgress, [0, 1], [0, maxFrameIndex]);
  const overlayOpacity = useTransform(frameProgress, (latest) => latest - Math.floor(latest));
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);

  // Preload a generous initial batch for smooth early scrolling
  useEffect(() => {
    const initial = Math.min(20, heroFrames.length);
    heroFrames.slice(0, initial).forEach((src, i) => {
      setTimeout(() => preloadFrame(src), i * 6);
    });
  }, []);

  useMotionValueEvent(frameProgress, "change", (latest) => {
    if (heroFrames.length <= 1) return;

    const baseIndex = Math.floor(latest);
    const overlayIndex = Math.min(maxFrameIndex, Math.ceil(latest));

    if (baseIndex !== lastBaseIndex.current) {
      lastBaseIndex.current = baseIndex;
      const el = baseImgRef.current;
      if (el && heroFrames[baseIndex]) {
        el.src = heroFrames[baseIndex];
      }
    }

    if (overlayIndex !== lastOverlayIndex.current) {
      lastOverlayIndex.current = overlayIndex;
      const el = overlayImgRef.current;
      if (el && heroFrames[overlayIndex]) {
        el.src = heroFrames[overlayIndex];
      }
      // Progressive preload ahead for buttery scrubbing
      const aheadEnd = Math.min(maxFrameIndex, overlayIndex + 15);
      for (let i = overlayIndex + 1; i <= aheadEnd; i++) {
        preloadFrame(heroFrames[i]);
      }
    }
  });

  return (
    <section
      id="home"
      className={`hero-section hero-scroll-section${reducedMotion ? " hero-reduced-motion" : ""}`}
      ref={heroRef}
    >
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div className="hero-animation-stage">
        <div className="hero-frame-viewport">
          <motion.div className="hero-frame-stack" style={{ scale: reducedMotion ? 1 : heroScale }}>
            <img
              ref={baseImgRef}
              className="hero-frame-image hero-frame-base"
              src={heroFrames[0]}
              alt=""
              aria-hidden="true"
            />
            <motion.img
              ref={overlayImgRef}
              className="hero-frame-image hero-frame-overlay"
              src={heroFrames[1] ?? heroFrames[0]}
              alt="Athlete training inside Fitness Factory gym"
              style={{ opacity: reducedMotion ? 1 : overlayOpacity }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}