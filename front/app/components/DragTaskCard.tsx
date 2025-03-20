"use client";

import React, { useRef, useEffect } from "react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import type { DragItem, DragCollectedProps } from "../types/dndTypes";
import type { Task } from "../types/taskTypes";

export const ItemTypes = {
  TASK: "TASK",
};

interface DragTaskCardProps {
  task: Task;
  index: number;
  // 詳細ボタン押下時に親コンポーネントへtask_idを通知
  onTaskDetail: (taskId: string) => void;
}

/** ドラッグ可能なタスクカード */
const DragTaskCard: React.FC<DragTaskCardProps> = ({ task, index, onTaskDetail }) => {
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, DragCollectedProps>({
    type: ItemTypes.TASK,
    item: { type: ItemTypes.TASK, index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 2) DOM用のrefを独自に定義
  const cardRef = useRef<HTMLDivElement>(null);

  // 3) useEffectでマウント後にimperativeにdrag(cardRef.current)を呼ぶ
  useEffect(() => {
    if (cardRef.current) {
      drag(cardRef.current);
    }
  }, [drag]);

  // 「詳細」ボタン押下ハンドラ
  const handleDetailClick = () => {
    onTaskDetail(task.task_id);
  };

  return (
    <div
      ref={cardRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
      className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded p-2 mb-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <h3 className="font-bold text-gray-900 dark:text-white">{task.task_name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {task.priority} / {task.assignment ?? "未定"}
      </p>
      <button
        onClick={handleDetailClick}
        className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
      >
        詳細
      </button>
    </div>
  );
};

export default DragTaskCard;
