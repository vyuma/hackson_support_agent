"use client";

import React from "react";

interface ProjectHeaderProps {
  projectId: string;
  idea: string;
  numPeople: number;
  onBack?: () => void;
}

export default function ProjectHeader({
  projectId,
  idea,
  numPeople,
  onBack,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow dark:shadow-gray-700 mb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">プロジェクト: {idea}</h1>
        <p className="text-gray-600 dark:text-gray-300">プロジェクトID: {projectId}</p>
        <p className="text-gray-600 dark:text-gray-300">参加人数: {numPeople}</p>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition"
        >
          戻る
        </button>
      )}
    </div>
  );
}
