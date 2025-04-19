"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sun, Moon, FolderTree, Terminal, Save, Info,  CalendarCheck,CloudUpload  } from "lucide-react";

import type { Task, ProjectData } from "../../types/taskTypes";
import Column from "@/components/Column";
import Loading from "@/components/Loading";
import ErrorShow from "@/components/Error";

const UNASSIGNED = "";
const DONE = "done";

// 自動スクロール用のコンポーネント
// DndProviderの中で使用するために別コンポーネントとして実装
function KanbanBoardContent({
  darkMode,
  project,
  members,
  tasks,
  unassignedTasks,
  doneTasks,
  handleDropTask,
  handleMemberNameChange,
  handleTaskDetail,
  handleSaveMembers,
  savingMembers
}: {
  darkMode: boolean;
  project: ProjectData;
  members: string[];
  tasks: Task[];
  unassignedTasks: Task[];
  doneTasks: Task[];
  handleDropTask: (dragIndex: number, newAssignment: string) => void;
  handleMemberNameChange: (colIndex: number, newName: string) => void;
  handleTaskDetail: (taskId: string) => void;
  handleSaveMembers: () => void;
  savingMembers: boolean;
}) {
  // スクロールコンテナのref
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  
  // ドラッグ状態を監視するためのDragLayerフック - DndProvider内で使用
  const { isDragging, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  // 自動スクロール処理
  useEffect(() => {
    if (!isDragging || !currentOffset || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    let scrollInterval: NodeJS.Timeout | null = null;
    
    // 自動スクロールの速度を計算（端から離れるほど速くなる）
    const calculateScrollSpeed = (position: number, edge: number, threshold: number): number => {
      const distance = Math.abs(position - edge);
      if (distance > threshold) return 0;
      
      // 端に近いほど速くスクロールする（最大20px/フレーム）
      return Math.round(20 * (1 - distance / threshold));
    };

    // スクロール関数
    const handleScroll = (): void => {
      const { x } = currentOffset;
      const scrollThreshold = 150; // スクロール開始までの距離（ピクセル）
      
      // 左端エリアでの左スクロール
      const leftSpeed = calculateScrollSpeed(x, containerRect.left, scrollThreshold);
      // 右端エリアでの右スクロール
      const rightSpeed = calculateScrollSpeed(x, containerRect.right, scrollThreshold);
      
      // 実際のスクロール処理
      if (leftSpeed > 0) {
        container.scrollLeft -= leftSpeed;
        setIsScrolling(true);
      } else if (rightSpeed > 0) {
        container.scrollLeft += rightSpeed;
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    // スクロールインターバルの設定
    scrollInterval = setInterval(handleScroll, 16); // 約60fps
    
    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      setIsScrolling(false);
    };
  }, [isDragging, currentOffset]);

  return (
    <div className="container mx-auto px-4 py-6 relative z-10 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* カンバンボード - 横スクロール可能なフレックスレイアウト */}
      <div 
        ref={scrollContainerRef}
        className={`overflow-x-auto cyber-scrollbar pb-4 flex-grow relative ${isScrolling ? 'auto-scrolling' : 'scrolling-active'}`}
      >
        {/* スクロールガイド - ドラッグ中にのみ表示 */}
        <div className="scroll-guide-left"></div>
        <div className="scroll-guide-right"></div>
        
        {/* ボードコンテンツ */}
        <div className="flex space-x-6 py-2 px-2" style={{ minWidth: 'max-content' }}>
          {/* 未定Column */}
          <div className="flex-shrink-0" style={{ width: '380px' }}>
            <Column
              assignmentKey={UNASSIGNED}
              columnTitle="未定"
              tasks={unassignedTasks}
              onDropTask={handleDropTask}
              isMemberColumn={false}
              onTaskDetail={handleTaskDetail}
              isDarkMode={darkMode}
            />
          </div>

          {/* メンバーColumn (各列) */}
          {members.map((memberName, colIndex) => {
            const assignedTasks = tasks.filter((t) => t.assignment === memberName);
            return (
              <div key={colIndex} className="flex-shrink-0" style={{ width: '380px' }}>
                <Column
                  assignmentKey={memberName}
                  columnTitle={memberName}
                  tasks={assignedTasks}
                  onDropTask={handleDropTask}
                  isMemberColumn={true}
                  onMemberNameChange={(newName: string) => handleMemberNameChange(colIndex, newName)}
                  onTaskDetail={handleTaskDetail}
                  isDarkMode={darkMode}
                />
              </div>
            );
          })}

          {/* 完了Column */}
          <div className="flex-shrink-0" style={{ width: '380px' }}>
            <Column
              assignmentKey={DONE}
              columnTitle="完了"
              tasks={doneTasks}
              onDropTask={handleDropTask}
              isMemberColumn={false}
              onTaskDetail={handleTaskDetail}
              isDarkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* 参加者名をまとめて保存するボタン */}
      <div className="flex justify-center mb-8 mt-6">
        <button
          onClick={handleSaveMembers}
          disabled={savingMembers}
          className={`px-6 py-3 rounded-full shadow-lg flex items-center justify-center transition-all ${
            savingMembers ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'
          } ${
            darkMode 
              ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-900' 
              : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
          }`}
        >
          {savingMembers ? (
            <div className="flex items-center">
              <div className={`animate-spin rounded-full h-4 w-4 border-2 ${
                darkMode ? 'border-gray-900 border-t-transparent' : 'border-white border-t-transparent'
              } mr-2`}></div>
              <span>保存中...</span>
            </div>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              <span>参加者名の変更を保存</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [members, setMembers] = useState<string[]>([]); // menber_info
  const [savingMembers, setSavingMembers] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  /** プロジェクト情報の取得 */
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("プロジェクトIDが指定されていません");
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`);
        if (!res.ok) throw new Error("プロジェクト取得エラー");
        const data: ProjectData = await res.json();

        // task_info => string[] => 各要素をパース (単一タスク or { task_id, task_name, ... })
        const allTasks: Task[] = [];
        data.task_info.forEach((taskStr, idx) => {
          try {
            const parsed = JSON.parse(taskStr);
            // 例: { "task_id": "abc123", "task_name": "...", ... }
            // __index でドラッグ用の一意番号を付ける
            allTasks.push({ ...parsed, __index: idx });
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr);
          }
        });

        setProject(data);
        setTasks(allTasks);
        setMembers(data.menber_info ?? []);
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
    fetchProject();
  }, [projectId]);

  /** カードのドロップ時に assignment を更新してPUT */
  const handleDropTask = useCallback(
    async (dragIndex: number, newAssignment: string) => {
      if (!project) return;
      const updatedTasks = tasks.map((t) =>
        t.__index === dragIndex ? { ...t, assignment: newAssignment } : t
      );
      setTasks(updatedTasks);

      // 更新用の task_info (再JSON化)
      const updatedTaskInfo = updatedTasks.map((t) =>
        JSON.stringify({
          task_id: t.task_id,       // ★ 追加
          task_name: t.task_name,
          priority: t.priority,
          content: t.content,
          detail: t.detail,
          assignment: t.assignment,
        })
      );

      const reqBody = {
        ...project,
        task_info: updatedTaskInfo,
        menber_info: members, 
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.project_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
          }
        );
        if (!res.ok) {
          console.error("プロジェクト更新失敗:", res.statusText);
        }
      } catch (updErr) {
        console.error("プロジェクト更新エラー:", updErr);
      }
    },
    [tasks, project, members]
  );

  /** 参加者名の変更イベント */
  const handleMemberNameChange = (colIndex: number, newName: string) => {
    const newArr = [...members];
    newArr[colIndex] = newName;
    setMembers(newArr);
  };

  /** 参加者名を保存 (PUT) する */
  const handleSaveMembers = async () => {
    if (!project) return;
    setSavingMembers(true);

    const updatedTaskInfo = tasks.map((t) =>
      JSON.stringify({
        task_id: t.task_id,
        task_name: t.task_name,
        priority: t.priority,
        content: t.content,
        detail: t.detail,
        assignment: t.assignment,
      })
    );

    const reqBody = {
      ...project,
      menber_info: members,
      task_info: updatedTaskInfo,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.project_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        }
      );
      if (!res.ok) {
        console.error("参加者名更新失敗:", res.statusText);
      } else {
        console.log("参加者名更新成功");
      }
    } catch (err) {
      console.error("参加者名更新エラー:", err);
    } finally {
      setSavingMembers(false);
    }
  };

  // タスク詳細ページへ (★ task_id を利用)
  const handleTaskDetail = (taskId: string) => {
    console.log("タスク詳細ページへ遷移:", taskId);
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>
        {/* サイバーパンク風ローディングアニメーション */}
        <Loading darkMode={darkMode} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorShow 
        error={error}
        darkMode={darkMode}
      />
    );
  }

  if (!project) return <p>プロジェクト情報がありません。</p>;

  // カラム用
  const unassignedTasks = tasks.filter((t) => t.assignment === UNASSIGNED);
  const doneTasks = tasks.filter((t) => t.assignment === DONE);

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
      
      {/* サイバーパンク風スクロールバー用のスタイル */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* サイバーパンク風スクロールバー */
        .cyber-scrollbar::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        
        .cyber-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(0, 255, 225, 0.1)' : 'rgba(138, 43, 226, 0.1)'};
          border-radius: 5px;
        }
        
        .cyber-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(0, 255, 225, 0.5)' : 'rgba(138, 43, 226, 0.5)'};
          border-radius: 5px;
          box-shadow: ${darkMode ? '0 0 5px #00ffe1, 0 0 8px #00ffe1' : '0 0 5px #8a2be2, 0 0 8px #8a2be2'};
        }
        
        .cyber-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(0, 255, 225, 0.8)' : 'rgba(138, 43, 226, 0.8)'};
        }
        
        .cyber-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? 'rgba(0, 255, 225, 0.5) rgba(0, 0, 0, 0.3)' : 'rgba(138, 43, 226, 0.5) rgba(255, 255, 255, 0.3)'};
        }
        
        /* スクロールアニメーション効果 */
        @keyframes borderGlow {
          0% {
            box-shadow: 0 0 5px ${darkMode ? 'rgba(0, 255, 225, 0.3)' : 'rgba(138, 43, 226, 0.3)'};
          }
          50% {
            box-shadow: 0 0 15px ${darkMode ? 'rgba(0, 255, 225, 0.7)' : 'rgba(138, 43, 226, 0.7)'};
          }
          100% {
            box-shadow: 0 0 5px ${darkMode ? 'rgba(0, 255, 225, 0.3)' : 'rgba(138, 43, 226, 0.3)'};
          }
        }
        
        .scrolling-active .cyber-scrollbar::-webkit-scrollbar-thumb,
        .auto-scrolling .cyber-scrollbar::-webkit-scrollbar-thumb {
          animation: borderGlow 2s infinite;
        }
        
        /* ドラッグ中のスクロールガイド表示 */
        .scroll-guide-left,
        .scroll-guide-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 150px;
          pointer-events: none;
          z-index: 20;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .scroll-guide-left {
          left: 0;
          background: linear-gradient(90deg, 
            ${darkMode ? 'rgba(0, 255, 225, 0.2)' : 'rgba(138, 43, 226, 0.2)'} 0%, 
            transparent 100%);
        }
        
        .scroll-guide-right {
          right: 0;
          background: linear-gradient(-90deg, 
            ${darkMode ? 'rgba(0, 255, 225, 0.2)' : 'rgba(138, 43, 226, 0.2)'} 0%, 
            transparent 100%);
        }
        
        .auto-scrolling .scroll-guide-left,
        .auto-scrolling .scroll-guide-right {
          opacity: 1;
        }
      ` }} />
      
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
                darkMode ? 'text-cyan-400' : 'text-purple-700'
              }`}>
                プロジェクト: <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>{project.idea}</span>
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ID: {project.project_id} / 人数: {project.num_people}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">

            <button
                onClick={() => router.push(`/projects/${projectId}/ganttChart`)}
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
              >
                < CalendarCheck  size={16} className="mr-2" />
                スケジュール
              </button>

              <button
                onClick={() => router.push(`/projects/${projectId}/directory`)}
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
              >
                <FolderTree size={16} className="mr-2" />
                ディレクトリ表示
              </button>
              
              <button
                onClick={() => router.push(`/projects/${projectId}/envHanson`)}
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
              >
                <Terminal size={16} className="mr-2" />
                環境構築
              </button>

              <button
                onClick={() => router.push(`/projects/${projectId}/specification`)}
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
              >
                <Info size={16} className="mr-2" />
                仕様書確認
              </button>

              <button
                onClick={() => router.push(`/projects/${projectId}/deploy`)}
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
              >
                <CloudUpload size={16} className="mr-2" />
                デプロイ
              </button>
              
            </div>
          </div>
        </div>
      </header>

      {/* DndProviderでラップして自動スクロール機能を使用 */}
      <DndProvider backend={HTML5Backend}>
        <KanbanBoardContent
          darkMode={darkMode}
          project={project}
          members={members}
          tasks={tasks}
          unassignedTasks={unassignedTasks}
          doneTasks={doneTasks}
          handleDropTask={handleDropTask}
          handleMemberNameChange={handleMemberNameChange}
          handleTaskDetail={handleTaskDetail}
          handleSaveMembers={handleSaveMembers}
          savingMembers={savingMembers}
        />
      </DndProvider>
      
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