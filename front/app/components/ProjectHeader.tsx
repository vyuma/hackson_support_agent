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
    <div className="flex items-center justify-between bg-white p-4 shadow mb-4">
      <div>
        <h1 className="text-xl font-bold">プロジェクト: {idea}</h1>
        <p className="text-gray-600">プロジェクトID: {projectId}</p>
        <p className="text-gray-600">参加人数: {numPeople}</p>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          戻る
        </button>
      )}
    </div>
  );
}
