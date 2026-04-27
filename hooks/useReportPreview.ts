"use client";

import { useState } from "react";

interface UseReportPreviewReturn {
  pdfData: string | null;
  isPreviewOpen: boolean;
  openPreview: (data: string) => void;
  closePreview: () => void;
  setPreviewOpen: (open: boolean) => void;
}

export function useReportPreview(): UseReportPreviewReturn {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = (data: string) => {
    setPdfData(data);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    // Clear data after dialog animation completes
    setTimeout(() => setPdfData(null), 300);
  };

  const setPreviewOpen = (open: boolean) => {
    if (!open) {
      closePreview();
    } else {
      setIsPreviewOpen(true);
    }
  };

  return {
    pdfData,
    isPreviewOpen,
    openPreview,
    closePreview,
    setPreviewOpen,
  };
}