"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

interface SummaryEditorProps {
  initialSummary: string;
  onSummaryChange?: (newSummary: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ initialSummary, onSummaryChange }) => {
  const [markdown, setMarkdown] = useState(initialSummary);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);
    // onSummaryChange が渡されていれば呼び出す
    onSummaryChange?.(newMarkdown);
  };

  return (
    <div className="my-4">
      <div className="flex justify-between mb-2">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 rounded ${!isPreview ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 rounded ${isPreview ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
        >
          プレビュー
        </button>
      </div>
      {isPreview ? (
        <div className="p-4 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={markdown}
          onChange={handleChange}
          rows={10}
          className="w-full p-4 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

export default SummaryEditor;
