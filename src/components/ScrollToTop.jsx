import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  // Disable browser's scroll restoration to avoid the browser restoring
  // the previous scroll position when navigating between routes.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      const originalRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      return () => {
        history.scrollRestoration = originalRestoration;
      };
    }
  }, []);

  // Scroll to top on route change. Some layouts use an app root or internal
  // scroll container (e.g. #app-root), so we try several strategies to ensure
  // we actually move to the top of the new page.
  useLayoutEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      // Use requestAnimationFrame to run after paint so content height is settled.
      const raf = requestAnimationFrame(() => {
        try {
          // 1) If your app uses a scrollable app root, reset it.
          const appRoot = document.getElementById("app-root");
          if (appRoot && typeof appRoot.scrollTo === "function") {
            appRoot.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }

          // 2) Also reset document scrolling just in case
          if (typeof window.scrollTo === "function") {
            window.scrollTo(0, 0);
          }
          if (document.documentElement) document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        } catch (e) {
          // ignore
        }
      });

      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  return null;
}
