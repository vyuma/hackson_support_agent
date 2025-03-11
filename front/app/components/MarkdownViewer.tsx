"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownViewerProps {
  markdown: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
