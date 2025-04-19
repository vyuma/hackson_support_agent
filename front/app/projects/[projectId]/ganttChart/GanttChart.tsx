"use client";

import React from "react";
import { Task, BASELINE_DATE, getDayFromDate } from "./GanttChartUtils";

// カスタムガントチャートコンポーネント
interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  darkMode?: boolean; // ダークモードフラグを追加
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  onTaskClick,
  darkMode = false // デフォルトはライトモード
}) => {
  // 全日数を計算
  const maxEndDay = Math.max(...tasks.map(task => getDayFromDate(task.end)));
  
  // 日付リストを生成
  const dates = Array.from({ length: maxEndDay }, (_, i) => {
    const date = new Date(BASELINE_DATE);
    date.setDate(date.getDate() + i);
    return date;
  });

  // 曜日に基づいたセルスタイルを返す関数
  const getDateCellStyle = (date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isWeekend 
      ? darkMode ? 'bg-gray-900/70' : 'bg-gray-800/20' 
      : darkMode ? 'bg-gray-950/50' : 'bg-black/10';
  };

  // ダークモードに基づいたテーマ色の設定
  const textColor = darkMode ? 'text-cyan-400' : 'text-purple-700';
  const borderColor = darkMode ? 'border-cyan-800/50' : 'border-purple-200';
  const barColor = darkMode ? 'bg-cyan-600' : 'bg-purple-600';
  const barHoverColor = darkMode ? 'hover:bg-cyan-500' : 'hover:bg-purple-500';
  const barBorderColor = darkMode ? 'border-cyan-400' : 'border-purple-400';
  const barGlow = darkMode 
    ? '0 0 10px rgba(0, 255, 225, 0.4)' 
    : '0 0 10px rgba(138, 43, 226, 0.4)';
  const textShadow = darkMode 
    ? '0 0 3px #00ffe1' 
    : '0 0 3px #8a2be2';

  return (
    <div className="rounded-lg p-6 shadow-lg backdrop-blur-sm mb-8 relative overflow-hidden border
      font-mono transition-all duration-300
      bg-opacity-40 overflow-x-auto
      z-10 relative
      border-2
      mt-6
      max-w-5xl mx-auto
      font-mono
      transition-all duration-300
      shadow-lg"
      style={{
        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: darkMode ? '#1e40af30' : '#c084fc30',
        boxShadow: darkMode 
          ? '0 10px 15px -3px rgba(0, 255, 225, 0.1), 0 4px 6px -2px rgba(0, 255, 225, 0.05)'
          : '0 10px 15px -3px rgba(138, 43, 226, 0.1), 0 4px 6px -2px rgba(138, 43, 226, 0.05)'
      }}
    >
      {/* サイバー風装飾要素 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-80" 
        style={{ 
          backgroundImage: darkMode 
            ? 'linear-gradient(to right, #00ffe1, transparent)' 
            : 'linear-gradient(to right, #8a2be2, transparent)' 
        }}
      ></div>
      
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l opacity-80" 
        style={{ 
          backgroundImage: darkMode 
            ? 'linear-gradient(to left, #00ffe1, transparent)' 
            : 'linear-gradient(to left, #8a2be2, transparent)' 
        }}
      ></div>

      <h2 className={`text-xl font-bold mb-6 ${textColor}`} style={{ textShadow }}>
        ガントチャート<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_表示</span>
      </h2>

      <div className="min-w-full">
        
        {/* 日付ヘッダー */}
        <div className="flex">
          <div 
            className={`w-40 min-w-40 flex-shrink-0 p-2 font-bold border-b border-r ${borderColor} ${textColor}`}
            style={{ 
              backdropFilter: 'blur(8px)',
              textShadow
            }}
          >
            タスク名
          </div>
          <div className="flex flex-grow">
            {dates.map((date, idx) => (
              <div 
                key={idx} 
                className={`w-10 flex-shrink-0 p-1 text-center text-xs border-b ${borderColor} ${getDateCellStyle(date)} ${textColor}`}
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
            <div key={task.id} className={`flex ${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-100/30'}`}>
              <div className={`w-40 min-w-40 flex-shrink-0 p-2 border-b border-r ${borderColor} truncate ${textColor}`}>
                {task.name}
              </div>
              <div className="flex flex-grow relative">
                {/* 日付グリッド */}
                {dates.map((date, idx) => (
                  <div 
                    key={idx} 
                    className={`w-10 flex-shrink-0 border-b ${borderColor} ${getDateCellStyle(date)}`}
                    style={{ minWidth: '2.5rem' }}
                  ></div>
                ))}
                
                {/* タスクバー - サイバー風スタイル */}
                <div 
                  className={`absolute top-1 h-6 ${barColor} ${barHoverColor} cursor-pointer transition-all duration-300 border ${barBorderColor}`}
                  style={{ 
                    left: `${startDay * 2.5}rem`, 
                    width: `${taskLength * 2.5}rem`,
                    boxShadow: barGlow,
                    clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
                  }}
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs truncate px-3">
                    {taskLength > 2 ? task.name : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* サイバー風デコレーション */}
      <div className="h-4 w-full relative mt-4 overflow-hidden">
        <div className={`absolute bottom-0 left-0 h-1 w-full ${barColor} opacity-30`} 
          style={{animation: 'cyberpulse 3s infinite linear'}}></div>
        <div className={`absolute bottom-0 left-0 h-1 w-1/3 ${barColor} opacity-50`} 
          style={{animation: 'cyberscan 4s infinite linear'}}></div>
        
        {/* アニメーションキーフレーム */}
        <style jsx>{`
          @keyframes cyberpulse {
            0%, 100% { transform: scaleX(0.1); left: 0; }
            50% { transform: scaleX(1); left: 0; }
          }
          @keyframes cyberscan {
            0% { left: -50%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
      
      {/* サイバー風の装飾エレメント */}
      <div className={`absolute -bottom-3 -right-3 w-16 h-16 ${borderColor}`}
        style={{ 
          borderTopWidth: '2px', 
          borderLeftWidth: '2px', 
          borderTopLeftRadius: '1rem' 
        }}
      ></div>
      
      <div className={`absolute -top-3 -left-3 w-16 h-16 ${borderColor}`}
        style={{ 
          borderBottomWidth: '2px', 
          borderRightWidth: '2px', 
          borderBottomRightRadius: '1rem' 
        }}
      ></div>
    </div>
  );
};

export default GanttChart;