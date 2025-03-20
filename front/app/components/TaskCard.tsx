"use client";

import React from "react";

interface Task {
  task_name: string;
  priority: "Must" | "Should" | "Could";
  content: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className="p-4 border dark:border-gray-600 rounded shadow bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.task_name}</h2>
      <p className="mt-1 text-gray-800 dark:text-gray-200">
        <span className="font-semibold">優先度:</span> {task.priority}
      </p>
      <p className="mt-1 text-gray-800 dark:text-gray-200">
        <span className="font-semibold">内容:</span> {task.content}
      </p>
    </div>
  );
};

export default TaskCard;
