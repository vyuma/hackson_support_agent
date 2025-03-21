"use client";

import React, { useRef, useEffect } from "react";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { CheckSquare, ListTodo, UserCheck } from "lucide-react";
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
  isDarkMode?: boolean;
}

const Column: React.FC<ColumnProps> = ({
  assignmentKey,
  columnTitle,
  tasks,
  onDropTask,
  isMemberColumn,
  onMemberNameChange,
  onTaskDetail,
  isDarkMode = true,
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: "TASK",
    drop: (item) => {
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

  // カラムアイコンの選択
  const getColumnIcon = () => {
    if (assignmentKey === "") return <ListTodo size={18} />;
    if (assignmentKey === "done") return <CheckSquare size={18} />;
    return <UserCheck size={18} />;
  };

  // カラムの背景色などのスタイル
  const getColumnStyles = () => {
    if (isDarkMode) {
      if (assignmentKey === "") {
        return "border-blue-800 bg-gray-800/80"; // 未定
      } else if (assignmentKey === "done") {
        return "border-green-800 bg-gray-800/80"; // 完了
      } else {
        return "border-pink-800 bg-gray-800/80"; // メンバー
      }
    } else {
      if (assignmentKey === "") {
        return "border-blue-300 bg-white/80"; // 未定
      } else if (assignmentKey === "done") {
        return "border-green-300 bg-white/80"; // 完了
      } else {
        return "border-purple-300 bg-white/80"; // メンバー
      }
    }
  };

  // タイトルの色スタイル
  const getTitleStyles = () => {
    if (isDarkMode) {
      if (assignmentKey === "") {
        return "text-blue-400"; // 未定
      } else if (assignmentKey === "done") {
        return "text-green-400"; // 完了
      } else {
        return "text-pink-400"; // メンバー
      }
    } else {
      if (assignmentKey === "") {
        return "text-blue-600"; // 未定
      } else if (assignmentKey === "done") {
        return "text-green-600"; // 完了
      } else {
        return "text-purple-600"; // メンバー
      }
    }
  };

  return (
    <div
      ref={columnRef}
      className={`rounded-lg shadow-lg border ${getColumnStyles()} 
        transition-all duration-300 backdrop-blur-sm
        ${isOver ? 'opacity-70 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* カラムヘッダー */}
      <div className={`p-4 border-b ${
        isDarkMode 
          ? 'border-gray-700/50' 
          : 'border-gray-200/50'
      }`}>
        <div className="flex items-center mb-1">
          <span className={`mr-2 ${getTitleStyles()}`}>
            {getColumnIcon()}
          </span>
          
          {isMemberColumn ? (
            // メンバー列のタイトルをテキストボックスにする
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => onMemberNameChange?.(e.target.value)}
              className={`font-bold border px-2 py-1 rounded w-full transition-all focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-1 focus:ring-pink-500'
                  : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-1 focus:ring-purple-400'
              }`}
              placeholder="担当者名"
            />
          ) : (
            // 未定/完了コラムはタイトルのまま表示
            <h2 className={`font-bold ${getTitleStyles()}`}>
              {columnTitle}
            </h2>
          )}
        </div>
        
        {/* タスク数カウンター */}
        <div className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          タスク数: {tasks.length}
        </div>
      </div>
      
      {/* タスクリスト */}
      <div className={`p-4 space-y-3 min-h-[150px] ${
        tasks.length === 0 
          ? isDarkMode
            ? 'border border-dashed border-gray-700 rounded-b-lg bg-gray-800/50 flex items-center justify-center'
            : 'border border-dashed border-gray-300 rounded-b-lg bg-gray-50/50 flex items-center justify-center'
          : ''
      }`}>
        {tasks.length > 0 ? (
          tasks.map((task, idx) => (
            <DragTaskCard
              key={task.__index ?? idx}
              task={task}
              index={task.__index ?? idx}
              onTaskDetail={onTaskDetail}
              isDarkMode={isDarkMode}
            />
          ))
        ) : (
          <p className={`text-sm text-center ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            ここにタスクを<br />ドラッグしてください
          </p>
        )}
      </div>
    </div>
  );
};

export default Column;