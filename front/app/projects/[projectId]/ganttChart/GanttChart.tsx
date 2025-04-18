"use client";

import React from "react";
import { Task, BASELINE_DATE, getDayFromDate } from "./GanttChartUtils";

// カスタムガントチャートコンポーネント
interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  // 全日数を計算
  const maxEndDay = Math.max(...tasks.map(task => getDayFromDate(task.end)));
  
  // 日付リストを生成
  const dates = Array.from({ length: maxEndDay }, (_, i) => {
    const date = new Date(BASELINE_DATE);
    date.setDate(date.getDate() + i);
    return date;
  });

  // 月表示用の日付リスト
  const months = dates.reduce((acc: { month: number; count: number }[], date, index) => {
    if (index === 0 || date.getDate() === 1) {
      acc.push({ month: date.getMonth() + 1, count: 1 });
    } else {
      acc[acc.length - 1].count++;
    }
    return acc;
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* 月ヘッダー */}
        <div className="flex">
          <div className="w-40 min-w-40 flex-shrink-0 p-2"></div>
          <div className="flex flex-grow">
            {months.map((month, idx) => (
              <div
                key={`month-${idx}`}
                className="flex-shrink-0 p-1 text-center text-xs font-bold border-b"
                style={{ width: `${month.count * 2.5}rem` }}
              >
                {month.month}月
              </div>
            ))}
          </div>
        </div>
        
        {/* 日付ヘッダー */}
        <div className="flex">
          <div className="w-40 min-w-40 flex-shrink-0 p-2 font-bold border-b border-r">
            タスク名
          </div>
          <div className="flex flex-grow">
            {dates.map((date, idx) => (
              <div 
                key={idx} 
                className={`w-10 flex-shrink-0 p-1 text-center text-xs border-b ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : ''}`}
                style={{ minWidth: '2.5rem' }}
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>
        
        {/* ボディ - タスク行 */}
        {tasks.map((task) => {
          const startDay = getDayFromDate(task.start) - 1; // 0-indexedに変換
          const endDay = getDayFromDate(task.end) - 1;     // 0-indexedに変換
          const taskLength = endDay - startDay + 1;
          
          return (
            <div key={task.id} className="flex hover:bg-gray-50">
              <div className="w-40 min-w-40 flex-shrink-0 p-2 border-b border-r truncate">
                {task.name}
              </div>
              <div className="flex flex-grow relative">
                {/* 日付グリッド */}
                {dates.map((date, idx) => (
                  <div 
                    key={idx} 
                    className={`w-10 flex-shrink-0 border-b ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : ''}`}
                    style={{ minWidth: '2.5rem' }}
                  ></div>
                ))}
                
                {/* タスクバー */}
                <div 
                  className="absolute top-1 h-6 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600 transition"
                  style={{ 
                    left: `${startDay * 2.5}rem`, 
                    width: `${taskLength * 2.5}rem`
                  }}
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs truncate px-1">
                    {taskLength > 2 ? task.name : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart; 