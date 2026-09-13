"use client";

import React, { useState } from "react";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

export function PDFViewer({ fileUrl }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-card-secondary flex items-center justify-center text-foreground-secondary">
          <FileText className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-foreground">No PDF available to display.</p>
        <p className="text-xs text-foreground-secondary">Upload a résumé to view its preview here.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background flex-1">
      {/* Top Document Toolbar - Full Width */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            Résumé Viewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Tab</span>
          </a>

          <a
            href={fileUrl}
            download="Resume.pdf"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* PDF Viewport - Full Width & Height */}
      <div className="w-full flex-1 relative bg-card overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/90 backdrop-blur-xs space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-medium text-foreground-secondary">Loading PDF document...</p>
          </div>
        )}

        <iframe
          src={fileUrl}
          width="100%"
          height="100%"
          className="w-full h-full border-none block"
          title="Resume PDF Viewer"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
