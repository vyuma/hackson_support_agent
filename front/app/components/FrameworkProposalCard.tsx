"use client";

import React from "react";

type FrameworkProposal = {
  name: string;
  priority: number;
  reason: string;
};

interface Props {
  framework: FrameworkProposal;
  selected: boolean;
  onSelect: () => void;
}

const FrameworkProposalCard: React.FC<Props> = ({ framework, selected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded shadow cursor-pointer transition ${
        selected 
          ? "border-blue-500 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30" 
          : "border-gray-300 dark:border-gray-600 dark:bg-gray-800"
      }`}
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{framework.name}</h3>
      <p className="mt-1 text-gray-800 dark:text-gray-200">優先順位: {framework.priority}</p>
      <p className="mt-1 text-gray-800 dark:text-gray-200">理由: {framework.reason}</p>
    </div>
  );
};

export default FrameworkProposalCard;
