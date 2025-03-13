"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ParticipantColumn from "../../components/ParticipantColumn";

/**
 * 画面表示で使用するTask型
 */
interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  assignee: string; // サーバーからは無い場合があるのでデフォルト値を考慮
}

/**
 * 画面上で扱うProject型
 */
interface Project {
  project_id: string;
  idea: string;
  num_people: number;
  tasks: Task[];
}

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  // URL: /projects/[projectId]/ から UUID を取得
  const projectId = pathname.split("/").pop();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const data = await res.json();

        // dataのフォーマット例:
        // {
        //   "project_id": "...",
        //   "idea": "string",
        //   "num_people": 2,
        //   "specification": "string",
        //   "selected_framework": "string",
        //   "directory_info": "string",
        //   "task_info": [
        //       "{\"task_name\": \"要件定義\", \"priority\": \"Must\", \"content\": \"...\"}"
        //   ]
        // }
        // → task_info は各要素が JSON文字列として格納されている

        // task_info の各要素をパースして、画面表示用に整形
        const parsedTasks: Task[] = data.task_info.map((taskStr: string) => {
          try {
            const parsed = JSON.parse(taskStr);
            return {
              taskName: parsed.task_name || "No Name",
              priority: parsed.priority || "Should", // Must / Should / Could
              content: parsed.content || "",
              assignee: parsed.assignee || "", // サーバーでassigneeが無い場合は空文字で対応
            };
          } catch (err) {
            console.error("タスク情報のパースエラー:", err);
            return {
              taskName: "Parse Error",
              priority: "Could",
              content: "",
              assignee: "",
            };
          }
        });

        const projectData: Project = {
          project_id: data.project_id,
          idea: data.idea,
          num_people: data.num_people,
          tasks: parsedTasks,
        };
        setProject(projectData);
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクトが見つかりません</p>;

  // 担当者（assignee）ごとにタスクをグループ化
  const participants = Array.from(new Set(project.tasks.map(task => task.assignee)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">プロジェクト作業（カンバン形式）</h1>
      <p className="mb-4">プロジェクトID: {project.project_id}</p>
      <p className="mb-4">アイデア: {project.idea}</p>
      <p className="mb-4">人数: {project.num_people}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {participants.map((participant) => {
          // 空文字（assigneeが設定されていない）用の表示
          const displayName = participant || "未担当";
          return (
            <ParticipantColumn
              key={displayName}
              participant={displayName}
              tasks={project.tasks.filter(task => task.assignee === participant)}
            />
          );
        })}
      </div>
    </div>
  );
}
