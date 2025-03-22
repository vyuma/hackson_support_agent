"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../components/MarkdownViewer";
import ChatBot from "../../../components/ChatBot";
import { FolderTree, ArrowLeft, Sun, Moon, AlertTriangle, Cpu } from "lucide-react";

export default function DirectoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const projectId = pathParts[pathParts.length - 2];

  // ディレクトリ構造を表示するための文字列
  const [directoryStructure, setDirectoryStructure] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");   // 実際の仕様書
  const [framework, setFramework] = useState<string>("");           // 実際のFW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // チャットbot用のダミーtaskDetail
  const dummyTaskDetail = "ディレクトリ確認のページなので、特にタスク詳細は不要";

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("プロジェクトIDが指定されていません");
      return;
    }

    // プロジェクト情報をGETし、directory_infoを表示
    const fetchProject = async () => {
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

        // ディレクトリ構造 (例: data.directory_info)
        setDirectoryStructure(data.directory_info || "");
        // 仕様書
        setSpecification(data.specification || "");
        // フレームワーク
        setFramework(data.selected_framework || "");
      } catch (err: unknown) {
        console.error("プロジェクト情報取得エラー:", err);
        setError("プロジェクト情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

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
              プロジェクトID: {projectId}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center mb-6">
          <FolderTree className={`mr-3 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={28} />
          <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
            ディレクトリ<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_構造</span>
          </h1>
        </div>
        
        <div className={`mb-8 rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
          darkMode 
            ? 'bg-gray-800/80 border-cyan-800/40' 
            : 'bg-white/90 border-purple-200'
        }`}>
          <div className={`p-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`flex items-center text-lg font-bold ${
              darkMode ? 'text-pink-400' : 'text-blue-600'
            }`}>
              <Cpu size={18} className="mr-2" />
              プロジェクトファイル構成
            </h2>
          </div>
          
          <div className="p-4">
            <MarkdownViewer markdown={directoryStructure} isDarkMode={darkMode} />
          </div>
        </div>

        {/* チャットボット */}
        <div className={`rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
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
              <div className={`w-4 h-4 rounded-full mr-2 ${
                darkMode ? 'bg-cyan-500 animate-pulse' : 'bg-purple-500 animate-pulse'
              }`}></div>
              サポートAI
            </h2>
          </div>
          
          <div className="p-4">
            <ChatBot
              specification={specification}
              directoryStructure={directoryStructure}
              framework={framework}
              taskDetail={dummyTaskDetail}
              isDarkMode={darkMode}
            />
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