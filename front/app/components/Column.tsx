"use client";

import React, { useRef, useEffect } from "react";
import { useDrop, DropTargetMonitor } from "react-dnd";
import type { DragItem } from "../types/dndTypes";
import type { Task } from "../types/taskTypes";
import DragTaskCard from "./DragTaskCard";

interface ColumnProps {
  assignmentKey: string;  // "", "done", or participant name
  columnTitle: string;
  tasks: Task[];
  onDropTask: (dragIndex: number, newAssignment: string) => void;
  isMemberColumn: boolean;
  onMemberNameChange?: (newName: string) => void;
  // ★ カードから「詳細」ボタン押下されたときのハンドラ
  onTaskDetail: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  assignmentKey,
  columnTitle,
  tasks,
  onDropTask,
  isMemberColumn,
  onMemberNameChange,
  onTaskDetail,
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: "TASK",
    drop: (item, monitor: DropTargetMonitor) => {
      onDropTask(item.index, assignmentKey);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (columnRef.current) {
      drop(columnRef.current);
    }
  }, [drop]);

  return (
    <div
      ref={columnRef}
      className="bg-gray-200 p-4 rounded min-h-[200px]"
      style={{ opacity: isOver ? 0.7 : 1 }}
    >
      {isMemberColumn ? (
        // メンバー列のタイトルをテキストボックスにする
        <input
          type="text"
          value={columnTitle}
          onChange={(e) => onMemberNameChange?.(e.target.value)}
          className="font-bold mb-2 border p-1 rounded w-full"
        />
      ) : (
        // 未定/完了コラムはタイトルのまま表示
        <h2 className="font-bold mb-2">{columnTitle}</h2>
      )}

      {tasks.map((task, idx) => (
        <DragTaskCard
          key={task.__index ?? idx}
          task={task}
          index={task.__index ?? idx}
          onTaskDetail={onTaskDetail} // ★
        />
      ))}
    </div>
  );
};

export default Column;
