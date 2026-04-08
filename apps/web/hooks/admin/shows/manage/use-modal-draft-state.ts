"use client";

import { useState } from "react";

export function useModalDraftState<TDraft>(createDraft: () => TDraft) {
  const [draft, setDraft] = useState(createDraft);

  function resetDraft() {
    setDraft(createDraft());
  }

  return {
    draft,
    setDraft,
    resetDraft,
  };
}
