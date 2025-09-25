import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);
  const scrollingRef = useRef(false);

  const scrollToTop = useCallback(() => {
    if (scrollingRef.current) return;

    scrollingRef.current = true;

    const root = document.documentElement;
    const body = document.body;
    const startPosition =
      window.pageYOffset || root.scrollTop || body.scrollTop;

    if (startPosition === 0) {
      scrollingRef.current = false;
      return;
    }

    const duration = 500;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Easing function for smoother animation
      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      const position = startPosition * (1 - easeInOutCubic(progress));
      window.scrollTo(0, position);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        scrollingRef.current = false;
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  // Disable browser's scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      const originalRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      return () => {
        history.scrollRestoration = originalRestoration;
      };
    }
  }, []);

  // Handle route changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      // Wait for any route transition effects to complete
      const timeoutId = setTimeout(() => {
        scrollToTop();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, scrollToTop]);

  return null;
}
