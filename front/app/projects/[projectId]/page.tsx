"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { ProjectData, Task } from "../../types/taskTypes";
import Column from "../../components/Column";

// カラム用ラベル
const UNASSIGNED = "";
const DONE = "done";

/** カンバンページ本体 */
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

        // task_info => string[] => 各要素を JSON.parse
        const allTasks: Task[] = [];
        data.task_info.forEach((taskInfoStr) => {
          try {
            const parsed = JSON.parse(taskInfoStr); 
            // parsed => { tasks: Task[] }
            if (Array.isArray(parsed.tasks)) {
              parsed.tasks.forEach((t: Task, idx: number) => {
                // __indexを付加しておく
                (t as any).__index = allTasks.length;
                allTasks.push(t);
              });
            }
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr);
          }
        });

        setProject(data);
        setTasks(allTasks);
        setParticipants(["A", "B"]);
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  /** カードをドロップした時に assignment を更新し、サーバーにも送る */
  const handleDropTask = useCallback(
    async (dragIndex: number, newAssignment: string) => {
      // タスクを更新
      const updatedTasks = tasks.map((task) => {
        if ((task as any).__index === dragIndex) {
          return { ...task, assignment: newAssignment };
        }
        return task;
      });
      setTasks(updatedTasks);

      // DB 更新 => project情報を再送
      if (!project) return;
      const newTaskInfo = buildTaskInfoObject(updatedTasks);
      const reqBody = {
        project_id: project.project_id,
        idea: project.idea,
        duration: project.duration,
        num_people: project.num_people,
        specification: project.specification,
        selected_framework: project.selected_framework,
        directory_info: project.directory_info,
        task_info: newTaskInfo, // string[]
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.project_id}`,
          {
            method: "PUT", // or POST など、サーバー仕様に合わせる
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

  // タスクの詳細ページへ
  const handleTaskClick = (index: number) => {
    router.push(`/projects/${projectId}/task/${index}`);
  };

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクト情報がありません。</p>;

  // カンバン表示用にタスクをフィルタ
  const unassigned = tasks.filter((t) => t.assignment === UNASSIGNED);
  const doneTasks = tasks.filter((t) => t.assignment === DONE);

  return (
    <DndProvider backend={HTML5Backend}>
      {/* ヘッダー */}
      <header className="p-4 bg-gray-800 text-white mb-4">
        <h1 className="text-2xl font-bold">プロジェクト: {project.idea}</h1>
        <p>ID: {project.project_id} / 人数: {project.num_people}</p>
      </header>

      {/* カラム群 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* 未定のコラム */}
        <Column
          assignmentKey={UNASSIGNED}
          columnTitle="未定"
          tasks={unassigned}
          onDropTask={handleDropTask}
        />
        {/* 参加者列 (複数) */}
        {participants.map((name) => {
          const participantTasks = tasks.filter((t) => t.assignment === name);
          return (
            <Column
              key={name}
              assignmentKey={name}
              columnTitle={name}
              tasks={participantTasks}
              onDropTask={handleDropTask}
            />
          );
        })}
        {/* 完了コラム */}
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

/** タスク配列 => task_info(string[]) へ変換する補助関数 */
function buildTaskInfoObject(allTasks: Task[]): string[] {
  // この例では { tasks: [...Task] } を 1要素の JSON 文字列に変換
  const obj = { tasks: allTasks };
  return [JSON.stringify(obj)];
}
