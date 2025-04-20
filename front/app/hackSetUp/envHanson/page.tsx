"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownViewer from "../../components/MarkdownViewer";
import { ArrowRight, Terminal, Code, Settings, Layout, Server, Sun, Moon, AlertTriangle, Rewind } from "lucide-react";

import Loading from "@/components/Loading";
import { taskDetailGetAndpost } from "./detail"
import { DivideTask, EnvHandsOn, TaskDetail } from "@/types/taskTypes";


export type detailRequestType = {
  idea: string;
  duration: string;
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  menber_info: string[];
  envHanson: string;
};



export default function EnvHandsOnPage() {
  const router = useRouter();
  const [envData, setEnvData] = useState<EnvHandsOn | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overall");
  const [darkMode, setDarkMode] = useState(true);
  const [processingStart, setProcessingStart] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  // 環境構築ハンズオンデータを取得する関数
  const fetchEnvHanson = async () =>{
        // 仕様書、フレームワーク、ディレクトリ情報を取得
        const specification = sessionStorage.getItem("specification");
        const framework = sessionStorage.getItem("framework");
        const directory = sessionStorage.getItem("directory");
    
        if (!specification || !framework || !directory) {
          alert("必要なデータが不足しています。");
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
      setEnvData(envData);
      return envData;
    } catch (err: unknown) {
      console.error(err);
      alert("環境構築APIの呼び出しに失敗しました");
      return null;
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    // セッションストレージから確認
    const storedEnv = sessionStorage.getItem("envHanson");
    
    if (storedEnv) {
      try {
        // すでにデータがあればそれを使用
        const parsedEnv: EnvHandsOn = JSON.parse(storedEnv);
        setEnvData(parsedEnv);
        setLoading(false);
      } catch (err) {
        console.error("環境構築データのパースエラー:", err);
        // エラーの場合は新たに取得
        fetchEnvHanson();
      }
    } else {
      // データがなければ新たに取得
      fetchEnvHanson();
    }
  }, []);
  
  
  /**
   * - detailedTasks が取得できるまで待機（最大30秒）
   * - セッションストレージから他の必要データも取得
   * - POST ボディを組み立てて DB へ送信
   * - 返却された project_id をもとに `/projects/${project_id}` へ遷移
   */

  const handleBack = async () => {
    setProcessingStart(true);
  
    try {
      // セッションストレージから各種データを取得
      const dream = sessionStorage.getItem("dream");         // アイデア
      const duration = sessionStorage.getItem("duration");   // 期間
      const numPeople = sessionStorage.getItem("numPeople"); // 人数
      const specification = sessionStorage.getItem("specification"); // 仕様書
      const framework = sessionStorage.getItem("framework");   // フレームワーク
      const directory = sessionStorage.getItem("directory");    // ディレクトリ情報
      // tasks は詳細なしのタスクリスト
      const tasks = sessionStorage.getItem("tasks");         // タスクリスト
      const envHanson = sessionStorage.getItem("envHanson");  // 環境構築ハンズオン
  
      if (!dream || !duration || !numPeople || !specification || !framework || !directory || !tasks || !envHanson) {
        alert("プロジェクト情報が不足しています。");
        setProcessingStart(false);
        return;
      }
      
      // 人数分のメンバーの文字列の配列を作成
      const members = Array.from({ length: parseInt(numPeople) }, () => "member" + Math.floor(Math.random() * 1000));
  
      // DB に送るリクエストボディを組み立て
      const requestBody:detailRequestType = {
        idea: dream,
        duration: duration,
        num_people: parseInt(numPeople, 10),
        specification: specification,
        selected_framework: framework,
        directory_info: directory,
        menber_info: members,
        envHanson: envHanson,
      };

  
      // JSON.parse を適用（文字列がエンコードされているため）
      // JSON.parse を適用（文字列がエンコードされているため）
      const taskList: DivideTask[] = JSON.parse(tasks);
      const projectId = await taskDetailGetAndpost(requestBody, taskList);
      if (!projectId) {
        throw new Error("プロジェクトIDが返されませんでした");
      }
      
      // 遷移前にステートをリセット
      setProcessingStart(false);
      router.push(`/projects/${projectId}`);
    } catch (err:unknown) {
      console.error("エラー発生:", err);
      let errorMessage = "プロジェクトの登録に失敗しました";
      if (err instanceof Error) {
        errorMessage += `: ${err.message}`;
      }
      alert(errorMessage);
      setProcessingStart(false);
    }
  };

  // セクションに応じたアイコンを取得する関数
  const getIconForSection = (section: string) => {
    switch (section) {
      case "overall": return <Terminal size={18} />;
      case "devcontainer": return <Settings size={18} />;
      case "frontend": return <Layout size={18} />;
      case "backend": return <Server size={18} />;
      default: return <Terminal size={18} />;
    }
  };

  return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    } relative overflow-hidden`}>
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
        className={`fixed top-6 right-6 p-3 rounded-full transition-all z-30 ${
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
      
      <div className="container mx-auto p-4 md:p-8 relative z-10">
        <div className={`backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-xl border transition-all ${
          darkMode 
            ? 'bg-gray-800 bg-opacity-70 border-cyan-500/30 shadow-cyan-500/20' 
            : 'bg-white bg-opacity-70 border-purple-500/30 shadow-purple-300/20'
        }`}>
          <div className="flex items-center mb-8">
            <Code className={`mr-3 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={28} />
            <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
              環境構築<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_ハンズオン</span>
            </h1>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              {/* サイバーパンク風ローディングアニメーション */}
              <Loading darkMode={darkMode} />
              {/* ローディングテキスト */}
              <div className={`mt-6 ${
                darkMode ? 'text-cyan-400' : 'text-purple-700'
              } font-bold tracking-wider flex flex-col items-center`}>
                <p className="text-sm mb-2">環境構築データをロード中...</p>
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
          ) : envData ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* サイドナビゲーション */}
              <div className="lg:col-span-1">
                <nav className={`sticky top-4 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-md overflow-hidden`}>
                  <ul>
                    {['overall', 'devcontainer', 'frontend', 'backend'].map((section) => (
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
                          <span className="capitalize">
                            {section === 'overall' ? '全体説明' : 
                            section === 'devcontainer' ? 'Devcontainer' : 
                            section === 'frontend' ? 'フロントエンド' : 'バックエンド'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                <div className="mt-6">
                  <button
                    onClick={handleBack}
                    disabled={processingStart}
                    className={`w-full py-4 flex items-center justify-center rounded-lg shadow-lg focus:outline-none transform transition ${
                      processingStart ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'
                    } ${
                      darkMode 
                        ? 'bg-gradient-to-r from-pink-600 to-cyan-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    }`}
                  >
                    {processingStart ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        <span>処理中...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold mr-2">コーディングを始める！</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* コンテンツエリア */}
              <div className="lg:col-span-3">
                <div className={`p-6 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800/70 border border-gray-700' 
                    : 'bg-white/90 border border-gray-200'
                }`}>
                  <div className="mb-4 pb-3 border-b border-dashed flex items-center">
                    <span className={`mr-2 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`}>
                      {getIconForSection(activeSection)}
                    </span>
                    <h2 className={`text-xl font-bold ${
                      darkMode ? 'text-cyan-400' : 'text-purple-700'
                    }`}>
                      {activeSection === 'overall' ? '全体のハンズオン説明' : 
                       activeSection === 'devcontainer' ? '.devcontainer の設定' : 
                       activeSection === 'frontend' ? 'フロントエンド環境構築' : 'バックエンド環境構築'}
                    </h2>
                  </div>
                  
                  <div className={`markdown-container ${
                    darkMode ? 'text-gray-300' : 'text-gray-800'
                  }`}>
                    <MarkdownViewer 
                      markdown={
                        activeSection === 'overall' ? envData.overall : 
                        activeSection === 'devcontainer' ? envData.devcontainer : 
                        activeSection === 'frontend' ? envData.frontend : envData.backend
                      } 
                      isDarkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-lg ${
              darkMode 
                ? 'bg-red-900/30 border border-red-700 text-red-300' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center mb-2">
                <AlertTriangle className="mr-2" size={20} />
                <h3 className="font-bold">環境構築情報が見つかりません</h3>
              </div>
              <p>前のステップからやり直してください。</p>
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