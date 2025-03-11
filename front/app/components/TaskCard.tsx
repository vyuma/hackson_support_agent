"use client";

import React from "react";

interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-bold">{task.taskName}</h2>
      <p className="mt-1">
        <span className="font-semibold">優先度:</span> {task.priority}
      </p>
      <p className="mt-1">
        <span className="font-semibold">内容:</span> {task.content}
      </p>
    </div>
  );
};

export default TaskCard;
