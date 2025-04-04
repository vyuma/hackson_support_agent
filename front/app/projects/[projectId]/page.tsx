"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sun, Moon, FolderTree, Terminal, Save, AlertTriangle } from "lucide-react";

import type { Task, ProjectData } from "../../types/taskTypes";
import Column from "../../components/Column";
import Loading from "@/components/Loading";
import ErrorShow from "@/components/Error";

const UNASSIGNED = "";
const DONE = "done";

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";
  const [darkMode, setDarkMode] = useState(true);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<string[]>([]); // menber_info
  const [savingMembers, setSavingMembers] = useState(false);

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
            </div>
          </div>
        </div>
      </header>

      <DndProvider backend={HTML5Backend}>
        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* カンバンボード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* 未定Column */}
            <Column
              assignmentKey={UNASSIGNED}
              columnTitle="未定"
              tasks={unassignedTasks}
              onDropTask={handleDropTask}
              isMemberColumn={false}
              onTaskDetail={handleTaskDetail}
              isDarkMode={darkMode}
            />

            {/* メンバーColumn (各列) */}
            {members.map((memberName, colIndex) => {
              const assignedTasks = tasks.filter((t) => t.assignment === memberName);
              return (
                <Column
                  key={colIndex}
                  assignmentKey={memberName}
                  columnTitle={memberName}
                  tasks={assignedTasks}
                  onDropTask={handleDropTask}
                  isMemberColumn={true}
                  onMemberNameChange={(newName: string) => handleMemberNameChange(colIndex, newName)}
                  onTaskDetail={handleTaskDetail}
                  isDarkMode={darkMode}
                />
              );
            })}

            {/* 完了Column */}
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

          {/* 参加者名をまとめて保存するボタン */}
          <div className="flex justify-center mb-8">
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