import { useEffect, useState } from "react";

export function useBoardExpand(disabled = false) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (disabled) setExpanded(false);
  }, [disabled]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("p2play:board-expand", { detail: { expanded } }),
    );
    return () => {
      if (expanded) {
        window.dispatchEvent(
          new CustomEvent("p2play:board-expand", { detail: { expanded: false } }),
        );
      }
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return {
    expanded,
    toggle: () => setExpanded((v) => !v),
    setExpanded,
  };
}
