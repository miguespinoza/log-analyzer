import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

import "./Tooltip.css";

type TooltipProps = {
  triggerRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
};

// simple tooltip that shows on trigger hover or focus
export function Tooltip({
  triggerRef,
  children,
  placement = "right",
}: TooltipProps) {
  const popperElement = useRef<HTMLDivElement>(null);
  const arrowElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(
    triggerRef.current,
    popperElement.current,
    {
      placement: placement,
      modifiers: [
        {
          name: "arrow",
          options: { element: arrowElement.current },
        },
      ],
    }
  );
  const [showPopper, setShowPopper] = useState(false);

  const onShow = useCallback(() => {
    setShowPopper(true);
  }, [setShowPopper]);
  const onHide = useCallback(() => {
    setShowPopper(false);
  }, [setShowPopper]);

  useEffect(() => {
    const trigger = triggerRef.current;
    trigger?.addEventListener("mouseenter", onShow);
    trigger?.addEventListener("mouseleave", onHide);
    trigger?.addEventListener("focus", onShow);
    trigger?.addEventListener("blur", onHide);
    return () => {
      trigger?.removeEventListener("mouseenter", onShow);
      trigger?.removeEventListener("mouseleave", onHide);
      trigger?.removeEventListener("focus", onShow);
      trigger?.removeEventListener("blur", onHide);
    };
  });

  return (
    <div
      ref={popperElement}
      data-testid="tooltip"
      role="tooltip"
      className="tooltip z-50"
      style={{ ...styles.popper, display: showPopper ? "block" : "none" }}
      {...attributes.popper}
    >
      <div
        className="arrow"
        data-popper-arrow
        ref={arrowElement}
        style={styles.arrow}
        {...attributes.arrow}
      />
      {children}
    </div>
  );
}
