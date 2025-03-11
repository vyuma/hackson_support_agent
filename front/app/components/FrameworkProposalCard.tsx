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
        selected ? "border-blue-500 bg-blue-100" : "border-gray-300"
      }`}
    >
      <h3 className="text-lg font-bold">{framework.name}</h3>
      <p className="mt-1">優先順位: {framework.priority}</p>
      <p className="mt-1">理由: {framework.reason}</p>
    </div>
  );
};

export default FrameworkProposalCard;
