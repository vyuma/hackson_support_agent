"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../components/MarkdownViewer";
import ChatBot from "../../../components/ChatBot";
import { Sun, Moon, ArrowLeft, Terminal, Globe, Server, Settings, Layers, MessageSquare, AlertTriangle } from 'lucide-react';

interface EnvHansonData {
  overall?: string;
  devcontainer?: string;
  frontend?: string;
  backend?: string;
}

export default function EnvHansonPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  // URL: /projects/[projectId]/envHanson のイメージ
  // projectIdは pathParts の最終要素の1つ手前
  const projectId = pathParts[pathParts.length - 2];

  // 環境構築情報 (パース後)
  const [envData, setEnvData] = useState<EnvHansonData | null>(null);

  // 仕様書・ディレクトリ構造・フレームワークなど
  const [specification, setSpecification] = useState("");
  const [directoryStructure, setDirectoryStructure] = useState("");
  const [framework, setFramework] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overall");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (!projectId) {
      setError("プロジェクトIDが指定されていません");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        // プロジェクト情報を取得
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

        // data.envHanson は JSON文字列 {"overall":"...","devcontainer":"...","frontend":"...","backend":"..."} の想定
        if (data.envHanson) {
          try {
            const parsedEnv = JSON.parse(data.envHanson) as EnvHansonData;
            setEnvData(parsedEnv);

            console.log("parsedEnv keys:", Object.keys(parsedEnv));

          } catch (parseErr) {
            console.error("envHansonのパースエラー:", parseErr);
            setEnvData(null);
          }
        } else {
          setEnvData(null);
        }

        // 仕様書やフレームワークなど必要に応じて取得
        setSpecification(data.specification || "");
        setFramework(data.selected_framework || "");
        setDirectoryStructure(data.directory_info || "");
      } catch (err: unknown) {
        console.error("プロジェクト情報取得エラー:", err);
        setError("プロジェクト情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const getIconForSection = (section: string) => {
    switch (section) {
      case "overall": return <Globe size={20} />;
      case "devcontainer": return <Settings size={20} />;
      case "frontend": return <Layers size={20} />;
      case "backend": return <Server size={20} />;
      default: return <Terminal size={20} />;
    }
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case "overall": return "全体のハンズオン";
      case "devcontainer": return ".devcontainer の設定";
      case "frontend": return "フロントエンド環境構築";
      case "backend": return "バックエンド環境構築";
      default: return "";
    }
  };

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
          <Terminal className={`mr-3 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={28} />
          <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
            環境構築<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_ハンズオン</span>
          </h1>
        </div>

        {envData ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* サイドナビゲーション */}
            <div className="lg:col-span-1">
              <div className={`sticky top-24 rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
                darkMode 
                  ? 'bg-gray-800/80 border-cyan-800/40' 
                  : 'bg-white/90 border-purple-200'
              }`}>
                <ul>
                  {Object.keys(envData).map((section) => (
                    envData[section as keyof EnvHansonData] && (
                      <li key={section}>
                        <button
                          onClick={() => setActiveSection(section)}
                          className={`w-full px-4 py-3 flex items-center transition-all ${
                            activeSection === section
                              ? darkMode
                                ? 'bg-gray-700 border-l-4 border-cyan-500 text-cyan-400'
                                : 'bg-purple-50 border-l-4 border-purple-500 text-purple-700'
                              : darkMode
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`mr-2 ${
                            activeSection === section
                              ? darkMode ? 'text-pink-500' : 'text-blue-600'
                              : ''
                          }`}>
                            {getIconForSection(section)}
                          </span>
                          <span>
                            {getSectionName(section)}
                          </span>
                        </button>
                      </li>
                    )
                  ))}
                </ul>
              </div>
              
              {/* チャットボット（モバイル表示向け） */}
              <div className={`mt-6 rounded-lg shadow-lg border transition-all backdrop-blur-sm lg:hidden ${
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
                
                <div className="p-4">
                  <ChatBot
                    specification={specification}
                    directoryStructure={directoryStructure}
                    framework={framework}
                    taskDetail={(envData?.overall || "") + (envData?.devcontainer || "") + (envData?.frontend || "") + (envData?.backend || "")}
                    isDarkMode={darkMode}
                  />
                </div>
              </div>
            </div>
            
            {/* メインコンテンツエリア */}
            <div className="lg:col-span-2">
              <div className={`mb-6 rounded-lg shadow-lg border transition-all backdrop-blur-sm ${
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
                    {getIconForSection(activeSection)}
                    <span className="ml-2">{getSectionName(activeSection)}</span>
                  </h2>
                </div>
                
                <div className="p-4">
                  <MarkdownViewer 
                    markdown={envData[activeSection as keyof EnvHansonData] || ""} 
                    isDarkMode={darkMode} 
                  />
                </div>
              </div>
            </div>
            
            {/* チャットボットサイドバー（デスクトップ向け） */}
            <div className="lg:col-span-2 hidden lg:block">
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
                    taskDetail={(envData?.overall || "") + (envData?.devcontainer || "") + (envData?.frontend || "") + (envData?.backend || "")}
                    isDarkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-lg ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>環境構築情報が見つかりません。</p>
          </div>
        )}
      </div>
      
      {/* フッター */}
      <footer className={`p-4 text-center ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-xs relative z-10`}>
      <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>
        <span className={darkMode ? 'text-gray-700' : 'text-gray-400'}>//</span>
        <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
      </div>
      </footer>

    </div>
  );
}