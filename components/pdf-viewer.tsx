"use client";

import { FunctionComponent, useState } from "react";
import { Resizable } from "re-resizable";

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  pdfUrl,
}: PdfViewerProps) => {
  const [width, setWidth] = useState(0);

  return (
    <Resizable
      size={{ width: width || "60%", height: "100vh" }}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      handleComponent={{
        right: (
          <div className="w-1.5 h-screen bg-neutral-200 dark:bg-black/70 cursor-col-resize" />
        ),
      }}
    >
      <iframe
        src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
        className="w-full h-full"
      />
    </Resizable>
  );
};

export default PdfViewer;
