"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Task, ProjectData } from "../../types/taskTypes";
import Column from "../../components/Column";

const UNASSIGNED = "";
const DONE = "done";

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<string[]>([]); // menber_info

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
    }
  };

  // タスク詳細ページへ (★ task_id を利用)
  const handleTaskDetail = (taskId: string) => {
    console.log("タスク詳細ページへ遷移:", taskId);
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクト情報がありません。</p>;

  // カラム用
  const unassignedTasks = tasks.filter((t) => t.assignment === UNASSIGNED);
  const doneTasks = tasks.filter((t) => t.assignment === DONE);

  return (
    <DndProvider backend={HTML5Backend}>
      <header className="p-4 bg-gray-800 dark:bg-gray-900 text-white mb-4">
        <h1 className="text-2xl font-bold">プロジェクト: {project.idea}</h1>
        <p>ID: {project.project_id} / 人数: {project.num_people}</p>
        {/* ディレクトリ表示ページに飛ばすボタン */}
        <button
          onClick={() => router.push(`/projects/${projectId}/directory`)}
          className="px-4 py-2 bg-blue-600 text-white rounded mt-2 mr-2 hover:bg-blue-700 transition"
        >ディレクトリ表示</button>
        {/* 環境構築ハンズオン表示ページに飛ばすボタン */}
        <button
          onClick={() => router.push(`/projects/${projectId}/envHanson`)}
          className="px-4 py-2 bg-blue-600 text-white rounded mt-2 hover:bg-blue-700 transition"
        >環境構築ハンズオンに戻る</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-900">
        {/* 未定Column */}
        <Column
          assignmentKey={UNASSIGNED}
          columnTitle="未定"
          tasks={unassignedTasks}
          onDropTask={handleDropTask}
          isMemberColumn={false}
          onTaskDetail={handleTaskDetail}  // ★コールバックを渡す
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
              onTaskDetail={handleTaskDetail} // ★
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
          onTaskDetail={handleTaskDetail} // ★
        />
      </div>

      {/* 参加者名をまとめて保存するボタン */}
      <div className="p-4 bg-gray-100 dark:bg-gray-900">
        <button
          onClick={handleSaveMembers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          参加者名の変更を保存
        </button>
      </div>
    </DndProvider>
  );
}
