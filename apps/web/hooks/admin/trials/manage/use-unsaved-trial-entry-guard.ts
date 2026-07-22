"use client";

import { useEffect, useRef, useState } from "react";

export function useUnsavedTrialEntryGuard(isDirty: boolean) {
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!allowLeaveRef.current) event.preventDefault();
    };
    const handleClick = (event: MouseEvent) => {
      if (allowLeaveRef.current || event.defaultPrevented || event.button !== 0)
        return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href, window.location.href);
      if (
        target.origin !== window.location.origin ||
        target.href === window.location.href
      )
        return;
      event.preventDefault();
      setPendingLeave(() => () => window.location.assign(target.href));
    };
    const handlePopState = () => {
      if (allowLeaveRef.current) return;
      window.history.forward();
      setPendingLeave(() => () => window.history.back());
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  function requestLeave(action: () => void) {
    if (!isDirty) action();
    else setPendingLeave(() => action);
  }

  return {
    isConfirmingLeave: pendingLeave !== null,
    requestLeave,
    cancelLeave: () => setPendingLeave(null),
    confirmLeave: () => {
      const action = pendingLeave;
      allowLeaveRef.current = true;
      setPendingLeave(null);
      action?.();
    },
  };
}
