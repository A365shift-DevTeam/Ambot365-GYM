import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import logoImg from "../assets/fitness logo.png";
import { heroFrames, preloadAllFrames } from "../utils/heroFrames";
import { useLenis } from "./SmoothScroll";

const MIN_LOAD_MS = 2200;
const EXIT_MS = 700;

export default function FrameLoader({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.body.style.overflow = "hidden";
    lenis?.stop();

    const startTime = Date.now();

    const finish = () => {
      setVisible(false);
      window.setTimeout(() => {
        document.body.style.overflow = "";
        lenis?.start();
        onComplete?.();
      }, EXIT_MS);
    };

    if (reducedMotion) {
      preloadAllFrames((ratio) => {
        setProgress(ratio);
        setFrameIndex(Math.floor(ratio * Math.max(heroFrames.length - 1, 0)));
      }).then(finish);
      return () => {
        document.body.style.overflow = "";
        lenis?.start();
      };
    }

    preloadAllFrames((ratio) => {
      setProgress(ratio);
      setFrameIndex(Math.floor(ratio * Math.max(heroFrames.length - 1, 0)));
    }).then(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOAD_MS - elapsed);
      window.setTimeout(finish, remaining);
    });

    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [lenis, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="frame-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
        >
          <img
            className="frame-loader-image"
            src={heroFrames[frameIndex] ?? heroFrames[0]}
            alt=""
            aria-hidden="true"
          />
          <div className="frame-loader-vignette" aria-hidden="true" />
          <div className="frame-loader-content">
            <img className="frame-loader-logo" src={logoImg} alt="Ambot365 Gym" />
            <p className="frame-loader-label">Loading...</p>
            <div className="frame-loader-track" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="frame-loader-fill"
                style={{ scaleX: progress }}
                initial={{ scaleX: 0 }}
              />
            </div>
            <span className="frame-loader-percent">{Math.round(progress * 100)}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}