"use client";

import React, { useRef, useEffect } from "react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import type { DragItem, DragCollectedProps } from "../types/dndTypes"; // あなたの型定義ファイル
import type { Task } from "../types/taskTypes"; // あなたの型定義ファイル

interface DragTaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

/** 何の種類のドラッグアイテムかを定義 */
export const ItemTypes = {
  TASK: "TASK",
};

const DragTaskCard: React.FC<DragTaskCardProps> = ({ task, index, onClick }) => {
  // 1) ドラッグ操作を定義
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
      drag(cardRef.current); // これでDOMとドラッグ操作を紐づけ
    }
  }, [drag]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
      className="bg-white border rounded p-2 mb-2 shadow hover:bg-gray-100"
    >
      <h3 className="font-bold">{task.task_name}</h3>
      <p className="text-sm text-gray-600">
        {task.priority} / {task.assignment ?? "未定"}
      </p>
    </div>
  );
};

export default DragTaskCard;
