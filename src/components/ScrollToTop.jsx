import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

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

  // Handle route changes - use useLayoutEffect to scroll before paint
  useLayoutEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
