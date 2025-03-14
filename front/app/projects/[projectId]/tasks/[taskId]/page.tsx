"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../../components/MarkdownViewer";
import type { Task } from "../../../../types/taskTypes";

export default function TaskDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  // URL: /projects/[projectId]/tasks/[taskId]
  const pathParts = pathname.split("/");
  const projectId = pathParts[pathParts.length - 3];
  const taskId = pathParts.pop() || "";

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId || !taskId) {
      setLoading(false);
      setError("パラメータが不足しています");
      return;
    }

    const fetchProjectAndFindTask = async () => {
      try {
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
        let found: Task | null = null;
        data.task_info.forEach((taskStr: string, idx: number) => {
          try {
            const parsed = JSON.parse(taskStr);
            // task_idプロパティを文字列に変換して比較
            if (String(parsed.task_id) === taskId) {
              found = parsed;
            }
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr, "at index", idx);
          }
        });
        if (found) {
          setTask(found);
        } else {
          setError("該当タスクが見つかりません");
        }
      } catch (err: any) {
        console.error("プロジェクト情報取得エラー:", err);
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndFindTask();
  }, [projectId, taskId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!task) return <p>タスク情報がありません</p>;

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-300 rounded mb-4"
      >
        戻る
      </button>
      <h1 className="text-2xl font-bold mb-2">{task.task_name}</h1>
      <p className="mb-4">
        タスクID: {task.task_id} / 優先度: {task.priority} / 担当: {task.assignment || "未定"}
      </p>
      <h2 className="text-xl font-semibold mb-2">概要:</h2>
      <p className="mb-2">{task.content}</p>
      <h2 className="text-xl font-semibold mb-2">詳細 (detail):</h2>
      <MarkdownViewer markdown={task.detail || ""} />
    </div>
  );
}
