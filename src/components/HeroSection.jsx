import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";


const heroFrames = Object.entries(
  import.meta.glob("../../frames/*.jpg", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

export default function HeroSection() {
  const heroRef = useRef(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);


  useMotionValueEvent(heroProgress, "change", (latest) => {
    if (heroFrames.length <= 1) {
      return;
    }

    const nextFrame = Math.min(heroFrames.length - 1, Math.floor(latest * heroFrames.length));
    setFrameIndex(nextFrame);
  });

  return (
    <section id="home" className="hero-section hero-scroll-section" ref={heroRef}>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div className="hero-animation-stage">
        <motion.img
          className="hero-frame-image"
          src={heroFrames[frameIndex] ?? heroFrames[0]}
          alt="Athlete training inside Fitness Factory gym"
          style={{ scale: heroScale }}
        />

      </div>
    </section>
  );
}
