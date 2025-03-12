"use client";

import React from "react";
import TaskCard from "./TaskCard";  // 既存のTaskCardをそのままimport

interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  // 必要に応じて assignee や taskId などを追加
}

interface ParticipantColumnProps {
  participant: string;
  tasks: Task[];
}

const ParticipantColumn: React.FC<ParticipantColumnProps> = ({ participant, tasks }) => {
  return (
    <div className="bg-gray-100 p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">{participant}</h2>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard key={task.taskName} task={task} />
        ))
      ) : (
        <p className="text-sm text-gray-500">タスクなし</p>
      )}
    </div>
  );
};

export default ParticipantColumn;
