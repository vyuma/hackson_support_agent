"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import GanttChart from "./GanttChart";
import { 
  ProjectData, 
  DurationData, 
  fetchProject, 
  fetchTaskGraph, 
  mapDurationsToTasks 
} from "./GanttChartUtils";
import { ArrowLeft, Sun, Moon } from "lucide-react";

import Loading from "@/components/Loading";
import Error from "@/components/Error";

const GanttChartClient: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [durations, setDurations] = useState<DurationData[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ダークモードの切り替え
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  }

  useEffect(() => {
    if (!projectId) return;
    
    const loadData = async () => {
      try {
        // プロジェクトデータ取得
        const proj = await fetchProject(projectId);
        setProjectData(proj);
        
        const durationsData = sessionStorage.getItem("durations");
        if (durationsData) {
          // セッションストレージから取得した場合は、JSON.parseして状態に保存
          setDurations(JSON.parse(durationsData));
        } else{// タスク期間取得API呼び出し
        const durationsData = await fetchTaskGraph(proj.duration, proj.task_info);
        sessionStorage.setItem("durations", JSON.stringify(durationsData));
        // タスク期間データを状態に保存
        setDurations(durationsData);}
      } catch (err: unknown) {
        setError("データの取得に失敗しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);

  // タスククリック時の処理
  const handleTaskClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  if (loading) {
    return (
       <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
                          darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                        }`}>
            {/* Glowing edges */}
            <div className="fixed bottom-0 left-0 right-0 h-1 z-1000">
                <div className={`h-full ${darkMode ? 'bg-cyan-500' : 'bg-purple-500'} animate-pulse`}></div>
            </div>
            <div className="fixed top-0 bottom-0 right-0 w-1 z-20">
                <div className={`w-full ${darkMode ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
            </div>
            {/* サイバーパンク風ローディングアニメーション */}
            <Loading darkMode={darkMode} />
        </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px]">
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
        <Error error={error} darkMode={darkMode} />
      </div>
    );
  }
  
  if (!projectData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
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
        <div className="font-bold">エラー</div>
        <p>プロジェクト情報がありません</p>
      </div>
    );
  }

  // タスクデータに変換
  const tasks = mapDurationsToTasks(durations);

  return (
<div className={`min-h-screen font-mono transition-all duration-500 flex flex-col ${
  darkMode ? 'bg-black text-cyan-400' : 'bg-white text-purple-600'
}`}>
  {/* サイバーグリッド背景 - よりアニメーション性を高めた */}
  <div className={`fixed inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-20' : 'opacity-15'}`}>
    <div className="absolute inset-0" style={{ 
      backgroundImage: `linear-gradient(${darkMode ? '#00ffe1' : '#9333ea'} 1px, transparent 1px), 
                      linear-gradient(90deg, ${darkMode ? '#00ffe1' : '#9333ea'} 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: '-1px -1px',
      animation: 'gridMove 20s linear infinite'
    }}></div>
  </div>
  
  {/* アニメーション用のスタイル */}
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes gridMove {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(40px);
      }
    }
    
    /* サイバーパンク風スクロールバー */
    .cyber-scrollbar::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    
    .cyber-scrollbar::-webkit-scrollbar-track {
      background: ${darkMode ? 'rgba(0, 255, 225, 0.1)' : 'rgba(147, 51, 234, 0.1)'};
      border-radius: 3px;
    }
    
    .cyber-scrollbar::-webkit-scrollbar-thumb {
      background: ${darkMode ? 'rgba(0, 255, 225, 0.5)' : 'rgba(147, 51, 234, 0.5)'};
      border-radius: 3px;
      box-shadow: ${darkMode ? '0 0 5px #00ffe1, 0 0 8px #00ffe1' : '0 0 5px #9333ea, 0 0 8px #9333ea'};
    }
    
    .cyber-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${darkMode ? 'rgba(0, 255, 225, 0.8)' : 'rgba(147, 51, 234, 0.8)'};
    }
    
    .cyber-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: ${darkMode ? 'rgba(0, 255, 225, 0.5) rgba(0, 0, 0, 0.3)' : 'rgba(147, 51, 234, 0.5) rgba(255, 255, 255, 0.3)'};
    }
  ` }} />
  
  {/* ホログラムのような装飾要素 */}
  <div className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 z-10"></div>
  <div className="fixed bottom-0 right-0 w-full h-16 bg-gradient-to-l from-cyan-500/10 to-purple-500/10 z-10"></div>
  
  {/* テーマ切り替えボタン - よりサイバーパンク的に */}
  <button 
    onClick={toggleDarkMode} 
    className={`fixed top-6 right-6 p-3 rounded-full transition-all z-30 border-2 ${
      darkMode 
        ? 'bg-black border-cyan-400 hover:bg-gray-900 text-cyan-400 shadow-lg shadow-cyan-500/50' 
        : 'bg-white border-purple-500 hover:bg-gray-100 text-purple-600 shadow-lg shadow-purple-500/50'
    }`}
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>

  {/* ヘッダー - 固定式サイバーパンク風に */}
  <header className={`sticky top-0 p-4 md:p-6 transition-all duration-300 z-20 backdrop-blur-md ${
    darkMode 
      ? 'bg-black/80 border-b-2 border-cyan-900/80 shadow-lg shadow-cyan-500/20' 
      : 'bg-white/80 border-b-2 border-purple-300/50 shadow-lg shadow-purple-500/20'
  }`}>
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className={`px-4 py-2 rounded-md flex items-center transition-all border-2 ${
            darkMode 
              ? 'bg-black hover:bg-gray-900 text-cyan-400 border-cyan-800 hover:border-cyan-600' 
              : 'bg-white hover:bg-gray-100 text-purple-600 border-purple-300 hover:border-purple-500'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          戻る
        </button>
        
        <h1 className={`text-2xl font-bold tracking-wider ${
          darkMode ? 'text-cyan-400' : 'text-purple-700'
        }`} style={{ 
          textShadow: darkMode ? '0 0 8px #00ffe1, 0 0 12px #00ffe1' : '0 0 8px #9333ea, 0 0 12px #9333ea' 
        }}>
          仕様書<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_確認</span>
        </h1>
        
        <div className={`text-sm px-3 py-1 rounded-md border-2 ${
          darkMode 
            ? 'text-cyan-400 border-cyan-800 bg-black/50' 
            : 'text-purple-700 border-purple-300 bg-white/50'
        }`}>
          プロジェクトID: {projectId}
        </div>
      </div>
    </div>
  </header>

  {/* メインコンテンツ - スクロール可能エリア */}
  <main className="flex-grow overflow-x-auto cyber-scrollbar">
    {/* GanttChatViewer - サイバー風 */}
    <div className="container mx-auto px-4 py-6 relative z-10">
      <div className="flex overflow-x-auto cyber-scrollbar pb-6 flex-col align-center">
        <div className="min-w-max">
          <div className={`max-w-5xl mx-auto relative z-10 p-5 mt-4`}>
            <div className={`rounded-lg p-6 border-2 backdrop-blur-sm ${
              darkMode 
                ? 'bg-gray-900/40 border-cyan-900 shadow-lg shadow-cyan-500/20' 
                : 'bg-purple-50/40 border-purple-200 shadow-lg shadow-purple-500/20'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-cyan-300' : 'text-purple-700'
              }`} style={{ 
                textShadow: darkMode ? '0 0 5px #00ffe1' : '0 0 5px #9333ea' 
              }}>
                {projectData.idea}
              </h2>
              
              <div className="mb-6 flex justify-between">
                <div className={`text-sm rounded-md px-3 py-2 border ${
                  darkMode 
                    ? 'text-cyan-400 border-cyan-900 bg-black/50' 
                    : 'text-purple-700 border-purple-300 bg-white/50'
                }`}>
                  プロジェクト期間: {projectData.duration}
                </div>
                <div className={`text-sm rounded-md px-3 py-2 border ${
                  darkMode 
                    ? 'text-cyan-400 border-cyan-900 bg-black/50' 
                    : 'text-purple-700 border-purple-300 bg-white/50'
                }`}>
                  タスク数: {tasks.length}件
                </div>
              </div>
              
              {tasks.length > 0 ? (
                <div className={`p-1 border-2 rounded-lg ${
                  darkMode 
                    ? 'border-cyan-900 bg-black/30' 
                    : 'border-purple-200 bg-white/30'
                }`}>
                  {/* サイバー風ガントチャート */}
                  <GanttChart 
                    tasks={tasks} 
                    onTaskClick={handleTaskClick}
                    darkMode={darkMode}
                  />
                </div>
              ) : (
                <div className={`text-center py-12 ${
                  darkMode ? 'text-cyan-600' : 'text-purple-400'
                }`}>
                  <div className="inline-block p-6 rounded-full border-2 border-dashed animate-pulse">
                    タスクが設定されていません
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  {/* フッター - 固定 */}
  <footer className={`sticky bottom-0 p-4 text-center transition-all duration-300 z-20 backdrop-blur-md ${
    darkMode 
      ? 'bg-black/80 border-t-2 border-cyan-900/80 text-cyan-600' 
      : 'bg-white/80 border-t-2 border-purple-300/50 text-purple-400'
  }`}>
    <div className="flex justify-between items-center">
      <div className={`animate-pulse opacity-50 ${darkMode ? 'text-cyan-500' : 'text-purple-400'}`}>
        <div className="text-xs">SYS::ONLINE</div>
      </div>
      
      <div className={`text-xs ${darkMode ? 'text-cyan-500' : 'text-purple-500'}`}>
        <span className={darkMode ? 'text-cyan-400' : 'text-purple-700'}>CYBER</span>
        <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.6.9
      </div>
      
      <div className={`text-xs ${darkMode ? 'text-cyan-600' : 'text-purple-400'}`}>
        <span className="animate-ping inline-block h-2 w-2 rounded-full mr-1"></span>
        接続中
      </div>
    </div>
  </footer>
</div>
    
  );
};

export default GanttChartClient; 