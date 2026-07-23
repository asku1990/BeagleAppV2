"use client";

import { useEffect, useRef, useState } from "react";

export function useUnsavedTrialEntryGuard(isDirty: boolean) {
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const pendingLeaveRef = useRef<(() => void) | null>(null);
  const allowLeaveRef = useRef(false);

  function queueLeave(action: () => void) {
    pendingLeaveRef.current = action;
    setIsConfirmingLeave(true);
  }

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = true;
    };
    const handleClick = (event: MouseEvent) => {
      if (
        allowLeaveRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      )
        return;
      const target = new URL(anchor.href, window.location.href);
      if (
        target.origin !== window.location.origin ||
        target.href === window.location.href
      )
        return;
      event.preventDefault();
      pendingLeaveRef.current = () => window.location.assign(target.href);
      setIsConfirmingLeave(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  function requestLeave(action: () => void) {
    if (!isDirty) action();
    else queueLeave(action);
  }

  return {
    isConfirmingLeave,
    requestLeave,
    cancelLeave: () => {
      pendingLeaveRef.current = null;
      setIsConfirmingLeave(false);
    },
    confirmLeave: () => {
      const action = pendingLeaveRef.current;
      pendingLeaveRef.current = null;
      if (!action) return;
      allowLeaveRef.current = true;
      setIsConfirmingLeave(false);
      action();
    },
  };
}
