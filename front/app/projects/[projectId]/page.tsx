"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Task, ProjectData } from "../../types/taskTypes";
import Column from "../../components/Column";

// カラム用ラベル
const UNASSIGNED = "";
const DONE = "done";

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // プロジェクト情報の取得
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("プロジェクトIDが指定されていません");
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`
        );
        if (!res.ok) throw new Error("プロジェクト取得エラー");
        const data: ProjectData = await res.json();

        /**
         * サーバーから返る task_info は string[] で、
         * 各要素が {
         *   "task_name": "...",
         *   "priority": "...",
         *   "content": "...",
         *   "detail": "...",
         *   "assignment": ""
         * } といった「単独タスク」だった場合
         */
        const allTasks: Task[] = [];
        data.task_info.forEach((taskStr, idx) => {
          try {
            const parsed = JSON.parse(taskStr);
            // parsed は単体タスクオブジェクトと想定:
            // { task_name: "", priority: "", content: "", detail: "", assignment: "" }
            // さらに、__indexを付与
            allTasks.push({
              ...parsed,
              __index: idx, // ユニークなindexにする
            });
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr);
          }
        });

        setProject(data);
        setTasks(allTasks);

        // 参加者リスト (仮)
        setParticipants(["A", "B"]);
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // カードのドロップ時に assignment を更新してサーバーにも送る
  const handleDropTask = useCallback(
    async (dragIndex: number, newAssignment: string) => {
      const updatedTasks = tasks.map((task) => {
        if (task.__index === dragIndex) {
          return { ...task, assignment: newAssignment };
        }
        return task;
      });
      setTasks(updatedTasks);

      if (!project) return;

      // task_info の更新
      // => 各タスクオブジェクトを JSON.stringify し直して配列化
      const updatedTaskInfo = updatedTasks.map((t) => JSON.stringify({
        task_name: t.task_name,
        priority: t.priority,
        content: t.content,
        detail: t.detail,
        assignment: t.assignment
      }));

      const reqBody = {
        project_id: project.project_id,
        idea: project.idea,
        duration: project.duration,
        num_people: project.num_people,
        specification: project.specification,
        selected_framework: project.selected_framework,
        directory_info: project.directory_info,
        task_info: updatedTaskInfo, // updated tasks
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
    [tasks, project]
  );

  // タスク詳細ページへ (例: indexベースで)
  const handleTaskClick = (index: number) => {
    router.push(`/projects/${projectId}/task/${index}`);
  };

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクト情報がありません。</p>;

  // カラム表示用
  const unassigned = tasks.filter((t) => t.assignment === UNASSIGNED);
  const doneTasks = tasks.filter((t) => t.assignment === DONE);
  const assigned = (name: string) => tasks.filter((t) => t.assignment === name);

  return (
    <DndProvider backend={HTML5Backend}>
      <header className="p-4 bg-gray-800 text-white mb-4">
        <h1 className="text-2xl font-bold">プロジェクト: {project.idea}</h1>
        <p>ID: {project.project_id} / 人数: {project.num_people}</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* 未定のコラム */}
        <Column
          assignmentKey={UNASSIGNED}
          columnTitle="未定"
          tasks={unassigned}
          onDropTask={handleDropTask}
        />
        {/* 参加者列 */}
        {participants.map((name) => (
          <Column
            key={name}
            assignmentKey={name}
            columnTitle={name}
            tasks={assigned(name)}
            onDropTask={handleDropTask}
          />
        ))}
        {/* 完了のコラム */}
        <Column
          assignmentKey={DONE}
          columnTitle="完了"
          tasks={doneTasks}
          onDropTask={handleDropTask}
        />
      </div>
    </DndProvider>
  );
}

/** Taskなどの型定義例

export interface Task {
  task_name: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  detail?: string;
  assignment?: string;
  __index?: number; // DnD用
}

export interface ProjectData {
  project_id: string;
  idea: string;
  duration: string;
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  task_info: string[];
}
*/
