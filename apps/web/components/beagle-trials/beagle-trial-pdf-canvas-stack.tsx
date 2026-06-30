"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type RenderTask,
} from "pdfjs-dist/legacy/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.mjs",
  import.meta.url,
).toString();

type BeagleTrialPdfCanvasStackItem = {
  trialEntryId: string;
};

type BeagleTrialPdfCanvasStackProps = {
  items: BeagleTrialPdfCanvasStackItem[];
};

type LoadedPdfPage = {
  data: Uint8Array;
  pageWidth: number;
};

export function getSharedPageWidth({
  items,
  pageWidths,
  failedTrialEntryIds,
}: {
  items: BeagleTrialPdfCanvasStackItem[];
  pageWidths: Record<string, number>;
  failedTrialEntryIds: Record<string, boolean>;
}): number | null {
  if (items.length === 0) {
    return null;
  }

  const loadedWidths = items.flatMap((item) => {
    const pageWidth = pageWidths[item.trialEntryId];
    return pageWidth ? [pageWidth] : [];
  });
  const allItemsSettled = items.every(
    (item) =>
      pageWidths[item.trialEntryId] || failedTrialEntryIds[item.trialEntryId],
  );

  if (!allItemsSettled || loadedWidths.length === 0) {
    return null;
  }

  return Math.max(...loadedWidths);
}

function getTrialPdfApiHref(trialEntryId: string): string {
  return `/api/trials/${encodeURIComponent(trialEntryId)}/pdf`;
}

function useElementWidth<TElement extends HTMLElement>() {
  const ref = useRef<TElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setWidth(element.clientWidth);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, width };
}

function getSharedScale(containerWidth: number, sharedPageWidth: number) {
  return containerWidth / sharedPageWidth;
}

function BeagleTrialPdfCanvas({
  trialEntryId,
  containerWidth,
  sharedPageWidth,
  onPageWidth,
  onPageLoadFailed,
}: {
  trialEntryId: string;
  containerWidth: number;
  sharedPageWidth: number | null;
  onPageWidth: (trialEntryId: string, pageWidth: number) => void;
  onPageLoadFailed: (trialEntryId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedPage, setLoadedPage] = useState<LoadedPdfPage | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPdfPage() {
      const response = await fetch(getTrialPdfApiHref(trialEntryId));
      if (!response.ok) {
        throw new Error(`Failed to load trial PDF ${trialEntryId}.`);
      }

      const data = new Uint8Array(await response.arrayBuffer());
      const loadingTask = getDocument({ data: data.slice() });
      const pdfDocument: PDFDocumentProxy = await loadingTask.promise;

      const page = await pdfDocument.getPage(1);
      const unscaledViewport = page.getViewport({ scale: 1 });
      await pdfDocument.cleanup();

      if (!cancelled) {
        setLoadedPage({
          data,
          pageWidth: unscaledViewport.width,
        });
        onPageWidth(trialEntryId, unscaledViewport.width);
      }
    }

    void loadPdfPage().catch(() => {
      if (!cancelled) {
        setLoadFailed(true);
        onPageLoadFailed(trialEntryId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onPageLoadFailed, onPageWidth, trialEntryId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedPage || !sharedPageWidth || containerWidth <= 0) {
      return;
    }
    const targetCanvas = canvas;
    const currentLoadedPage = loadedPage;
    const currentSharedPageWidth = sharedPageWidth;

    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let pdfDocument: PDFDocumentProxy | null = null;

    async function renderPdfPage() {
      const loadingTask = getDocument({ data: currentLoadedPage.data.slice() });
      pdfDocument = await loadingTask.promise;

      if (cancelled) {
        return;
      }

      const page: PDFPageProxy = await pdfDocument.getPage(1);
      const scale = getSharedScale(containerWidth, currentSharedPageWidth);
      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;
      const context = targetCanvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas rendering context is unavailable.");
      }

      targetCanvas.width = Math.floor(viewport.width * outputScale);
      targetCanvas.height = Math.floor(viewport.height * outputScale);
      targetCanvas.style.width = `${Math.floor(viewport.width)}px`;
      targetCanvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      renderTask = page.render({
        canvas: targetCanvas,
        canvasContext: context,
        viewport,
      });
      await renderTask.promise;
    }

    void renderPdfPage().catch((error) => {
      if (!cancelled) {
        throw error;
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
      void pdfDocument?.cleanup();
    };
  }, [containerWidth, loadedPage, sharedPageWidth]);

  if (loadFailed) {
    return (
      <div className="flex w-full justify-center bg-background px-4 py-6">
        <div
          className="w-full max-w-screen-sm rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
          data-trial-entry-id={trialEntryId}
        >
          Pöytäkirjaa ei voitu ladata.
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center bg-background">
      <canvas
        ref={canvasRef}
        aria-label="AJOK koirakohtainen pöytäkirja"
        className="block max-w-full"
        data-trial-entry-id={trialEntryId}
      />
    </div>
  );
}

export function BeagleTrialPdfCanvasStack({
  items,
}: BeagleTrialPdfCanvasStackProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [pageWidths, setPageWidths] = useState<Record<string, number>>({});
  const [failedTrialEntryIds, setFailedTrialEntryIds] = useState<
    Record<string, boolean>
  >({});
  const sharedPageWidth = getSharedPageWidth({
    items,
    pageWidths,
    failedTrialEntryIds,
  });
  const handlePageWidth = useCallback(
    (trialEntryId: string, pageWidth: number) => {
      setPageWidths((current) => ({
        ...current,
        [trialEntryId]: pageWidth,
      }));
    },
    [],
  );
  const handlePageLoadFailed = useCallback((trialEntryId: string) => {
    setFailedTrialEntryIds((current) => ({
      ...current,
      [trialEntryId]: true,
    }));
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {items.map((item) => (
        <BeagleTrialPdfCanvas
          key={item.trialEntryId}
          trialEntryId={item.trialEntryId}
          containerWidth={width}
          sharedPageWidth={sharedPageWidth}
          onPageWidth={handlePageWidth}
          onPageLoadFailed={handlePageLoadFailed}
        />
      ))}
    </div>
  );
}
