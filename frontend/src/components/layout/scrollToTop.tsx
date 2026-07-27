import { useEffect } from "react";

type ScrollToTopProps = {
  dependency?: unknown;
};

export function ScrollToTop({ dependency }: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, [dependency]);

  return null;
}
