"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader, } from "lucide-react";

interface DownloadCardButtonProps {
  userId: string;
  employeeId: string | null;
}

export function DownloadCardButton({
  userId,
  employeeId,
}: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!employeeId) {
      toast.error("Employee ID is required to generate a card");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(`/api/employee-card/${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download card");
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employee-card-${employeeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Employee card downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download card",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading || !employeeId}
      className="gap-2 truncate"
    >
      {isDownloading ? (
        <>
          <Loader className="size-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          Download Employee Card
        </>
      )}
    </Button>
  );
}
