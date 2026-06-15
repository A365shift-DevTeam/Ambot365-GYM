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
  if (!src) {
    return;
  }

  const image = new Image();
  image.src = src;
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const lastBaseIndex = useRef(-1);
  const lastOverlayIndex = useRef(-1);
  const [baseSrc, setBaseSrc] = useState(heroFrames[0]);
  const [overlaySrc, setOverlaySrc] = useState(heroFrames[1] ?? heroFrames[0]);
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

  useEffect(() => {
    heroFrames.slice(0, 4).forEach(preloadFrame);
  }, []);

  useMotionValueEvent(frameProgress, "change", (latest) => {
    if (heroFrames.length <= 1) {
      return;
    }

    const baseIndex = Math.floor(latest);
    const overlayIndex = Math.min(maxFrameIndex, Math.ceil(latest));

    if (baseIndex !== lastBaseIndex.current) {
      lastBaseIndex.current = baseIndex;
      setBaseSrc(heroFrames[baseIndex]);
    }

    if (overlayIndex !== lastOverlayIndex.current) {
      lastOverlayIndex.current = overlayIndex;
      setOverlaySrc(heroFrames[overlayIndex]);
      preloadFrame(heroFrames[Math.min(maxFrameIndex, overlayIndex + 1)]);
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
            <img className="hero-frame-image hero-frame-base" src={baseSrc} alt="" aria-hidden="true" />
            <motion.img
              className="hero-frame-image hero-frame-overlay"
              src={overlaySrc}
              alt="Athlete training inside Fitness Factory gym"
              style={{ opacity: reducedMotion ? 1 : overlayOpacity }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}