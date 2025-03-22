"use client";

import React, { useRef } from "react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { Info, ArrowUpRight, Star, Clock, BarChart } from "lucide-react";
import type { DragItem } from "../types/dndTypes";
import type { Task } from "../types/taskTypes";

interface DragTaskCardProps {
  task: Task;
  index: number;
  onTaskDetail: (taskId: string) => void;
  isDarkMode?: boolean;
}

const DragTaskCard: React.FC<DragTaskCardProps> = ({ 
  task, 
  index, 
  onTaskDetail,
  isDarkMode = true
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: "TASK",
    item: { type: "TASK", index }, // typeプロパティを追加
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  React.useEffect(() => {
    if (dragRef.current) {
      drag(dragRef.current);
    }
  }, [drag]);

  // 優先度に基づいて色とアイコンを設定
  const getPriorityStyles = () => {
    if (isDarkMode) {
      switch (task.priority) {
        case "Must":
          return {
            borderColor: "border-red-600",
            bgColor: "bg-red-900/20",
            textColor: "text-red-400",
            icon: <Star size={14} className="text-red-400" />
          };
        case "Should":
          return {
            borderColor: "border-yellow-600",
            bgColor: "bg-yellow-900/20",
            textColor: "text-yellow-400",
            icon: <Clock size={14} className="text-yellow-400" />
          };
        case "Could":
          return {
            borderColor: "border-blue-600",
            bgColor: "bg-blue-900/20",
            textColor: "text-blue-400",
            icon: <BarChart size={14} className="text-blue-400" />
          };
        default:
          return {
            borderColor: "border-gray-600",
            bgColor: "bg-gray-900/30",
            textColor: "text-gray-400",
            icon: null
          };
      }
    } else {
      switch (task.priority) {
        case "Must":
          return {
            borderColor: "border-red-400",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            icon: <Star size={14} className="text-red-600" />
          };
        case "Should":
          return {
            borderColor: "border-yellow-400",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-700",
            icon: <Clock size={14} className="text-yellow-700" />
          };
        case "Could":
          return {
            borderColor: "border-blue-400",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            icon: <BarChart size={14} className="text-blue-600" />
          };
        default:
          return {
            borderColor: "border-gray-300",
            bgColor: "bg-gray-50",
            textColor: "text-gray-600",
            icon: null
          };
      }
    }
  };

  const priorityStyle = getPriorityStyles();

  return (
    <div
      ref={dragRef}
      className={`rounded-lg shadow-sm border-l-4 transition-all ${priorityStyle.borderColor} ${
        isDarkMode 
          ? 'bg-gray-800 shadow-gray-900/40' 
          : 'bg-white shadow-gray-200'
      } ${
        isDragging 
          ? 'opacity-50 shadow-lg transform rotate-2 scale-105' 
          : 'opacity-100'
      }`}
      style={{ cursor: "grab" }}
    >
      <div className="p-3">
        {/* タスク名とプライオリティ */}
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-sm ${
            isDarkMode ? 'text-cyan-300' : 'text-purple-700'
          }`}>
            {task.task_name}
          </h3>
          
          <div className={`flex items-center text-xs px-2 py-0.5 rounded ${priorityStyle.bgColor} ${priorityStyle.textColor}`}>
            {priorityStyle.icon}
            <span className="ml-1">{task.priority}</span>
          </div>
        </div>
        
        {/* タスク内容 */}
        <p className={`text-xs mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {task.content.length > 120
            ? `${task.content.substring(0, 120)}...`
            : task.content}
        </p>
        
        {/* アクションボタン */}
        <div className="flex justify-end">
          <button
            onClick={() => onTaskDetail(task.task_id)}
            className={`text-xs px-2 py-1 rounded flex items-center transition-all ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400'
                : 'bg-gray-100 hover:bg-gray-200 text-purple-600'
            }`}
          >
            <Info size={12} className="mr-1" />
            詳細
            <ArrowUpRight size={12} className="ml-1" />
          </button>
        </div>
      </div>
      
      {/* 下部デコレーション */}
      <div className={`h-0.5 rounded-b-lg ${
        isDarkMode
          ? 'bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent'
          : 'bg-gradient-to-r from-transparent via-purple-500/30 to-transparent'
      }`}></div>

    </div>
  );
};

export default DragTaskCard;