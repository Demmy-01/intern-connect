import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ smooth = true }) {
  const { pathname } = useLocation();
  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }, [pathname, smooth]);

  return null;
}
