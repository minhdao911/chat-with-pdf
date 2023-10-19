"use client";

import { FunctionComponent } from "react";

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  pdfUrl,
}: PdfViewerProps) => {
  return (
    <div className="flex-[4]">
      <iframe
        src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
        className="w-full h-full"
      />
    </div>
  );
};

export default PdfViewer;
