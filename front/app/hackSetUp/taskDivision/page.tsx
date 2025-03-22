"use client";

import React, { useEffect, useState, useRef} from "react";
import { useRouter } from "next/navigation";
import TaskCard from "../../components/TaskCard";
import { Sun, Moon, CheckCircle, AlertTriangle, List, ArrowRight } from "lucide-react";

interface Task {
  task_name: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  // detail は UI には表示せず、API呼び出し結果としてセッションストレージに保存するだけ
  detail?: string;
}


interface DirectoryResponse {
  directory_structure: string;
}

interface TaskResponse {
  tasks: Task[];
}

export default function TaskDivisionPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // fetchDirectoryAndTasks が既に呼ばれたかどうかのフラグ
  const hasFetchedRef = useRef(false);

  // 初回ロード時に、ディレクトリ作成APIとタスク分割APIを呼び出す
  const fetchTaskDivision = async () => {
    if (typeof window === "undefined") return;

    // セッションストレージから仕様書とフレームワーク情報を取得
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    if (!specification || !framework) {
      setError("必要なデータ（仕様書、フレームワーク情報）が見つかりません。");
      setLoading(false);
      return;
    }

    // ディレクトリ作成APIを呼び出す
    const dirRes = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/directory/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework, specification }),
      }
    );
    if (!dirRes.ok) {
      throw new Error("ディレクトリ作成APIエラー: " + dirRes.statusText);
    }
    const dirData: DirectoryResponse = await dirRes.json();
    const directoryText = dirData.directory_structure;
    // ディレクトリ情報をセッションストレージに保存
    sessionStorage.setItem("directory", directoryText);

    // タスク分割APIを呼び出す
    const tasksRes = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/get_object_and_tasks/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specification, directory: directoryText, framework }),
      }
    );
    if (!tasksRes.ok) {
      throw new Error("タスク分割APIエラー: " + tasksRes.statusText);
    }
    const tasksData: TaskResponse = await tasksRes.json();
    // タスク情報をセッションストレージに保存
    sessionStorage.setItem("taskRes", JSON.stringify(tasksData));
    // UI には詳細なしのタスクリストを表示する
    setTasks(tasksData.tasks);
  };


  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchDirectoryAndTasks = async () => {
      try {
        await fetchTaskDivision();
      } catch (err: unknown) {
        console.error(err);
        setError("タスク分割APIの呼び出しに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchDirectoryAndTasks();
  }, []);
// タスク詳細APIの呼び出し（422の場合、タスク分割APIのみ再実行）


  // 環境構築ハンズオンAPI呼び出し＆遷移処理
  const handleProceedToEnv = async () => {
    // タスク内容（非詳細版）をセッションストレージに保存
    sessionStorage.setItem("tasks", JSON.stringify(tasks));

    // 仕様書、フレームワーク、ディレクトリ情報を取得
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    const directory = sessionStorage.getItem("directory");

    if (!specification || !framework || !directory) {
      alert("必要なデータが不足しています。");
      return;
    }

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/environment/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specification, directory, framework }),
        }
      );
      if (!res.ok) {
        throw new Error("環境構築APIエラー: " + res.statusText);
      }
      const envData = await res.json();
      // envDataは { overall: string, devcontainer: string, frontend: string, backend: string } を想定
      sessionStorage.setItem("envHanson", JSON.stringify(envData));
      router.push("/hackSetUp/envHanson");
    } catch (err: unknown) {
      console.error(err);
      alert("環境構築APIの呼び出しに失敗しました");
    }
  };

  return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    } relative overflow-hidden p-4 md:p-8`}>
      {/* アニメーション背景グリッド */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-20' : 'opacity-10'}`}>
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
        className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* 光るエッジライン */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-20">
        <div className={`h-full ${darkMode ? 'bg-cyan-500' : 'bg-purple-500'} animate-pulse`}></div>
      </div>
      <div className="fixed top-0 bottom-0 right-0 w-1 z-20">
        <div className={`w-full ${darkMode ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-xl border transition-all ${
          darkMode 
            ? 'bg-gray-800 bg-opacity-70 border-cyan-500/30 shadow-cyan-500/20' 
            : 'bg-white bg-opacity-70 border-purple-500/30 shadow-purple-300/20'
        }`}>
          <div className="flex items-center mb-6">
            <List className={`mr-3 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={28} />
            <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
              タスク<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_分割</span>
            </h1>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
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
              
              {/* ローディングテキスト */}
              <div className={`mt-6 ${
                darkMode ? 'text-cyan-400' : 'text-purple-700'
              } font-bold tracking-wider flex flex-col items-center`}>
                <p className="text-sm mb-2">タスク情報を分析中...</p>
                <div className="flex space-x-1">
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`}></span>
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></span>
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className={`p-6 rounded-lg ${
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
          ) : (
            <>
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                darkMode 
                  ? 'bg-gray-700 bg-opacity-50 border-pink-500 text-gray-300' 
                  : 'bg-purple-50 border-blue-500 text-gray-700'
              }`}>
                <p>プロジェクトのタスクが以下のように分割されました。各タスクには優先度が設定されています。</p>
              </div>
            
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <TaskCard 
                    key={index} 
                    task={task} 
                    isDarkMode={darkMode}
                  />
                ))}
              </div>
            </>
          )}
          
          {!loading && !error && tasks.length > 0 && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleProceedToEnv}
                className={`px-8 py-3 flex items-center justify-center rounded-full shadow-lg focus:outline-none transform transition hover:-translate-y-1 ${
                  darkMode 
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-900 focus:ring-2 focus:ring-cyan-400' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white focus:ring-2 focus:ring-purple-400'
                }`}
              >
                <CheckCircle size={18} className="mr-2" />
                <span>確認 環境構築ハンズオンに進む</span>
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>
        
        <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>
          <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
        </div>
      </div>
    </div>
  );
}