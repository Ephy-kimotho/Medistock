"use client";

import { useState } from "react";
import { Download, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadPdf } from "@/lib/utils";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: string | null;
  filename: string;
  title?: string;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  pdfData,
  filename,
  title = "Report Preview",
}: PDFPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDownload = () => {
    if (pdfData) {
      downloadPdf(pdfData, filename);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsLoading(true);
      setError(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
     <DialogContent className="max-w-[95vw] lg:max-w-225 h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!pdfData}
                className="gap-2"
              >
                <Download className="size-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/30 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader className="size-6 text-azure animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading preview...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <p className="text-sm text-muted-foreground">
                  Unable to preview PDF in browser.
                </p>
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-azure hover:bg-blue-600"
                >
                  <Download className="size-4" />
                  Download Instead
                </Button>
              </div>
            </div>
          )}

          {pdfData && (
            <iframe
              src={`data:application/pdf;base64,${pdfData}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="PDF Preview"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
