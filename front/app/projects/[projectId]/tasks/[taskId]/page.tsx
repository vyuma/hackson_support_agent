"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../../components/MarkdownViewer";
import ChatBot from "../../../../components/ChatBot";
import { ArrowLeft, Cpu, Star, Clock, BarChart, User, Sun, Moon, AlertTriangle, FileText, MessageSquare } from "lucide-react";
import type { Task } from "../../../../types/taskTypes";

export default function TaskDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  // URL: /projects/[projectId]/tasks/[taskId]
  const pathParts = pathname.split("/");
  const projectId = pathParts[pathParts.length - 3];
  const taskId = pathParts.pop() || "";
  
  const [darkMode, setDarkMode] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 仕様書やディレクトリ構成、フレームワークなど、DBから取得しておいたり、
  // あるいはsessionStorageから読み込む等、好きな方法で用意する
  const [specification, setSpecification] = useState<string>("");
  const [directoryStructure, setDirectoryStructure] = useState<string>("");
  const [framework, setFramework] = useState<string>("");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 優先度に基づいてアイコンと色を取得
  const getPriorityDetails = () => {
    if (task) {
      if (darkMode) {
        switch (task.priority) {
          case "Must":
            return { icon: <Star size={16} className="mr-1" />, color: "text-red-400" };
          case "Should":
            return { icon: <Clock size={16} className="mr-1" />, color: "text-yellow-400" };
          case "Could":
            return { icon: <BarChart size={16} className="mr-1" />, color: "text-blue-400" };
          default:
            return { icon: null, color: "text-gray-400" };
        }
      } else {
        switch (task.priority) {
          case "Must":
            return { icon: <Star size={16} className="mr-1" />, color: "text-red-600" };
          case "Should":
            return { icon: <Clock size={16} className="mr-1" />, color: "text-yellow-700" };
          case "Could":
            return { icon: <BarChart size={16} className="mr-1" />, color: "text-blue-600" };
          default:
            return { icon: null, color: "text-gray-600" };
        }
      }
    }
    return { icon: null, color: "" };
  };

  useEffect(() => {
    if (!projectId || !taskId) {
      setLoading(false);
      setError("パラメータが不足しています");
      return;
    }

    const fetchProjectAndFindTask = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) {
          console.error("プロジェクト情報取得失敗:", res.statusText);
          setError("プロジェクト情報の取得に失敗しました");
          return;
        }
        const data = await res.json();

        // data 内から 仕様書・ディレクトリ構成・フレームワークを設定
        setSpecification(data.specification || "");
        setDirectoryStructure(data.directory_info || "");
        setFramework(data.selected_framework || "");

        console.log("specification:", data.specification);
        console.log("directory_info:", data.directory_info);
        console.log("selected_framework:", data.selected_framework);
        console.log("task_info:", data.task_info);

        // タスクを検索
        let found: Task | null = null;
        data.task_info.forEach((taskStr: string, idx: number) => {
          try {
            const parsed = JSON.parse(taskStr);
            // task_idプロパティを文字列に変換して比較
            if (String(parsed.task_id) === taskId) {
              found = parsed;
            }
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr, "at index", idx);
          }
        });
        if (found) {
          setTask(found);
        } else {
          setError("該当タスクが見つかりません");
        }
      } catch (err: unknown) {
        console.error(err);
        // エラーオブジェクトかどうかを確認し、適切にメッセージを抽出
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Unknown error occurred';
          
        alert("DBへの登録に失敗しました: " + errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndFindTask();
  }, [projectId, taskId]);

  if (loading) {
    return (
      <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>
        {/* サイバーパンク風ローディングアニメーション */}
        <div className="relative w-24 h-24">
          {/* 回転する外側リング */}
          <div className={`absolute inset-0 border-4 border-transparent ${
            darkMode 
              ? 'border-t-cyan-500 border-r-pink-400' 
              : 'border-t-purple-600 border-r-blue-500'
          } rounded-full animate-spin`}></div>
          
          {/* パルスする内側サークル */}
          <div className={`absolute inset-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
            <div className={`w-10 h-10 ${
              darkMode ? 'bg-cyan-500/20' : 'bg-purple-500/20'
            } rounded-full animate-ping`}></div>
          </div>
          
          {/* 文字 */}
          <div className={`absolute inset-0 flex items-center justify-center text-xs ${
            darkMode ? 'text-cyan-400' : 'text-purple-700'
          } font-bold`}>
            LOADING
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className={`p-6 rounded-lg max-w-md ${
          darkMode 
            ? 'bg-red-900/30 border border-red-700 text-red-300' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center mb-2">
            <AlertTriangle className="mr-2" size={20} />
            <h3 className="font-bold">エラーが発生しました</h3>
          </div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className={`p-6 rounded-lg max-w-md ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700 text-gray-300' 
            : 'bg-gray-50 border border-gray-200 text-gray-800'
        }`}>
          <p>タスク情報がありません</p>
        </div>
      </div>
    );
  }

  const priorityDetails = getPriorityDetails();

  return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
    }`}>
      {/* アニメーション背景グリッド */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-10' : 'opacity-5'}`}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px), 
                           linear-gradient(90deg, ${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '-1px -1px'
        }}></div>
      </div>
      
      {/* テーマ切り替えボタン */}
      <button 
        onClick={toggleDarkMode} 
        className={`fixed top-6 right-6 p-3 rounded-full transition-all z-30 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* ヘッダー */}
      <header className={`p-4 md:p-6 transition-all duration-300 z-10 relative ${
        darkMode 
          ? 'bg-gray-800/80 border-b border-cyan-800/50 shadow-lg shadow-cyan-900/20' 
          : 'bg-white/80 backdrop-blur-sm border-b border-purple-200 shadow-lg shadow-purple-200/20'
      }`}>
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.back()} 
              className={`px-4 py-2 rounded-md flex items-center transition-all ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                  : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
              }`}
            >
              <ArrowLeft size={16} className="mr-2" />
              戻る
            </button>
            
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              プロジェクトID: {projectId} / タスクID: {taskId}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* タスク詳細セクション (左側3カラム) */}
          <div className="lg:col-span-3">
            <div className={`mb-6 rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
              darkMode 
                ? 'bg-gray-800/80 border-cyan-800/40' 
                : 'bg-white/90 border-purple-200'
            }`}>
              <div className={`p-4 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
                  {task.task_name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className={`flex items-center ${priorityDetails.color}`}>
                    {priorityDetails.icon}
                    <span>優先度: {task.priority}</span>
                  </div>
                  
                  <div className={`flex items-center ${
                    darkMode ? 'text-pink-400' : 'text-blue-600'
                  }`}>
                    <User size={16} className="mr-1" />
                    <span>担当: {task.assignment || "未定"}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h2 className={`flex items-center text-lg font-bold mb-3 ${
                    darkMode ? 'text-pink-400' : 'text-blue-600'
                  }`}>
                    <Cpu size={18} className="mr-2" />
                    概要
                  </h2>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {task.content}
                  </p>
                </div>
                
                <div>
                  <h2 className={`flex items-center text-lg font-bold mb-3 ${
                    darkMode ? 'text-pink-400' : 'text-blue-600'
                  }`}>
                    <FileText size={18} className="mr-2" />
                    詳細
                  </h2>
                  <div className={`rounded-lg border ${
                    darkMode 
                      ? 'border-gray-700 bg-gray-800/50' 
                      : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <MarkdownViewer markdown={task.detail || ""} isDarkMode={darkMode} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* チャットボットセクション (右側2カラム) */}
          <div className="lg:col-span-2">
            <div className={`sticky top-24 rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
              darkMode 
                ? 'bg-gray-800/80 border-pink-800/40' 
                : 'bg-white/90 border-blue-200'
            }`}>
              <div className={`p-4 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`flex items-center text-lg font-bold ${
                  darkMode ? 'text-cyan-400' : 'text-purple-600'
                }`}>
                  <MessageSquare size={18} className="mr-2" />
                  サポートAI
                </h2>
              </div>
              
              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                <ChatBot
                  specification={specification}
                  directoryStructure={directoryStructure}
                  framework={framework}
                  taskDetail={task.detail || ""}
                  isDarkMode={darkMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* フッター */}
      <footer className={`p-4 text-center ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-xs relative z-10`}>
      <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>
        <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
      </div>
      </footer>

    </div>
  );
}