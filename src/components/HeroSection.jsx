import { motion, useMotionValueEvent, useScroll } from "framer-motion";
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

const preloadedFrames = new Set();

function preloadFrame(src) {
  if (!src || preloadedFrames.has(src)) return;
  preloadedFrames.add(src);
  const image = new Image();
  image.src = src;
}

export default function HeroSection({ children }) {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const baseImgRef = useRef(null);
  const overlayImgRef = useRef(null);
  const lastBaseIndex = useRef(-1);
  const lastOverlayIndex = useRef(-1);

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

  const [heroScale, setHeroScale] = useState(1);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  // Preload a generous initial batch for smooth early scrolling
  useEffect(() => {
    const initial = Math.min(30, heroFrames.length);
    heroFrames.slice(0, initial).forEach((src, i) => {
      setTimeout(() => preloadFrame(src), i * 6);
    });
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (heroFrames.length <= 1) return;

    let latest = 0;

    if (trackRef.current && stickyRef.current) {
      if (isMobile) {
        // Bulletproof mobile logic: Ensure JS and CSS are 100% in sync
        const maxScroll = mobileScrollDistance || window.innerHeight * 4;
        const progress = Math.min(Math.max(y / maxScroll, 0), 1);
        latest = progress * maxFrameIndex;
        setHeroScale(1 + progress * 0.08);
      } else {
        // Desktop logic using rects
        const rect = trackRef.current.getBoundingClientRect();
        const scrolled = -rect.top;
        const stickyHeight = stickyRef.current.offsetHeight;
        const stickyOffsetTop = stickyRef.current.offsetTop;
        
        const scrollDistance = Math.max(rect.height - stickyHeight - stickyOffsetTop, 1);
        const progress = Math.min(Math.max(scrolled / scrollDistance, 0), 1);
        latest = progress * maxFrameIndex;
        setHeroScale(1 + progress * 0.08);
      }
    }

    if (reducedMotion) {
      setHeroScale(1);
    }

    const baseIndex = Math.floor(latest);
    const overlayIndex = Math.min(maxFrameIndex, Math.ceil(latest));

    if (baseIndex !== lastBaseIndex.current) {
      lastBaseIndex.current = baseIndex;
      if (baseImgRef.current && heroFrames[baseIndex]) {
        baseImgRef.current.src = heroFrames[baseIndex];
      }
    }

    if (overlayIndex !== lastOverlayIndex.current) {
      lastOverlayIndex.current = overlayIndex;
      if (overlayImgRef.current && heroFrames[overlayIndex]) {
        overlayImgRef.current.src = heroFrames[overlayIndex];
      }
      // Progressive preload ahead and behind for buttery scrubbing in both directions
      const aheadEnd = Math.min(maxFrameIndex, overlayIndex + 20);
      const behindEnd = Math.max(0, baseIndex - 20);
      
      for (let i = overlayIndex + 1; i <= aheadEnd; i++) {
        preloadFrame(heroFrames[i]);
      }
      for (let i = baseIndex - 1; i >= behindEnd; i--) {
        preloadFrame(heroFrames[i]);
      }
    }

    if (!reducedMotion) {
      setOverlayOpacity(latest - baseIndex);
    } else {
      setOverlayOpacity(1);
    }
  });

  return (
    <section className={`hero-section${reducedMotion ? " hero-reduced-motion" : ""}`}>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div id="home" className="hero-scroll-track" ref={trackRef}>
        <div className="hero-sticky-wrapper" ref={stickyRef}>
          <div className="hero-canvas-wrapper">
            <motion.div className="hero-frame-stack" style={{ scale: heroScale }}>
              <img
                ref={baseImgRef}
                className="hero-frame-image hero-frame-base"
                src={heroFrames[Math.max(0, lastBaseIndex.current)]}
                alt=""
                aria-hidden="true"
              />
              <img
                ref={overlayImgRef}
                className="hero-frame-image hero-frame-overlay"
                src={heroFrames[Math.max(1, lastOverlayIndex.current)] ?? heroFrames[0]}
                alt="Athlete training inside Fitness Factory gym"
                style={{ opacity: overlayOpacity }}
              />
            </motion.div>
          </div>
          {isMobile && <div className="hero-next-section">{children}</div>}
        </div>
        {/* Spacer to create the scroll track height within the content box so position: sticky can slide */}
        {isMobile && mobileScrollDistance > 0 && (
          <div style={{ height: `${mobileScrollDistance}px` }} />
        )}
      </div>
      {!isMobile && <div className="hero-next-section">{children}</div>}
    </section>
  );
}