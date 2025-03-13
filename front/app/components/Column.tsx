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
}

export const Column: React.FC<ColumnProps> = ({
  assignmentKey,
  columnTitle,
  tasks,
  onDropTask,
}) => {
  /** 
   * 1) 自前のRef。HTMLDivElementを指す。 
   * 2) useDrop は refを返すのではなく「drop(node)を呼んで接続」する形にする
   */
  const columnRef = useRef<HTMLDivElement>(null);

  // useDropの設定
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: "TASK", // 例: ItemTypes.TASK でもOK
    drop: (item: DragItem, monitor: DropTargetMonitor) => {
      onDropTask(item.index, assignmentKey);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  /**
   * マウントまたは依存変化時に、columnRef.current と drop を接続する
   * → これにより、columnRef が指すDOM要素が「ドロップ領域」として有効になる
   */
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
      <h2 className="font-bold mb-2">{columnTitle}</h2>
      {tasks.map((task, idx) => (
        <DragTaskCard
          key={`${columnTitle}-${idx}`}
          task={task}
          index={task.__index ?? idx}
          onClick={() => {
            /* クリック時の処理 */
          }}
        />
      ))}
    </div>
  );
};

export default Column;
