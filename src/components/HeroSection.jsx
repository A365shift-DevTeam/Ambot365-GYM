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
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

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
    <section id="home" className="hero-section hero-scroll-section" ref={heroRef}>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div className="hero-animation-stage">
        <motion.div className="hero-frame-stack" style={{ scale: heroScale }}>
          <img className="hero-frame-image hero-frame-base" src={baseSrc} alt="" aria-hidden="true" />
          <motion.img
            className="hero-frame-image hero-frame-overlay"
            src={overlaySrc}
            alt="Athlete training inside Fitness Factory gym"
            style={{ opacity: overlayOpacity }}
          />
        </motion.div>
      </div>
    </section>
  );
}