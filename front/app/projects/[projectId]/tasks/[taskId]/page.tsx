"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MarkdownViewer from "../../../../components/MarkdownViewer";

interface Task {
  taskId: string;
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  details: string;
  assignee: string;
}

interface Project {
  project_id: string;
  idea: string;
  num_people: number;
  tasks: Task[];
}

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!projectId || !taskId) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + `/projects/${projectId}`
        );
        if (!res.ok) throw new Error("プロジェクト情報の取得に失敗しました");
        const data: Project = await res.json();
        const foundTask = data.tasks.find((t) => t.taskId === taskId);
        if (!foundTask) {
          setError("タスクが見つかりません");
        } else {
          setTask(foundTask);
        }
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, taskId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!task) return <p>タスクが見つかりません</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">タスク詳細</h1>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">{task.taskName}</h2>
        <p className="mt-2">
          <strong>優先度:</strong> {task.priority}
        </p>
        <p className="mt-2">
          <strong>内容:</strong> {task.content}
        </p>
        <div className="mt-2">
          <strong>詳細:</strong>
          <MarkdownViewer markdown={task.details} />
        </div>
        <p className="mt-2">
          <strong>担当者:</strong> {task.assignee}
        </p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
