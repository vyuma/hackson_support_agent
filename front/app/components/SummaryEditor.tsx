"use client";

import React, { useState } from "react";

interface SummaryEditorProps {
  initialSummary: string;
  onSummaryChange?: (newSummary: string) => void;
}

// 仕様書エディタのコンポーネント
const SummaryEditor: React.FC<SummaryEditorProps> = ({ initialSummary, onSummaryChange }) => {
  const [summary, setSummary] = useState(initialSummary);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setSummary(newValue);
    onSummaryChange && onSummaryChange(newValue);
  };

  return (
    <div className="my-4">
      <textarea
        value={summary}
        onChange={handleChange}
        rows={10}
        className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SummaryEditor;
