"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../../components/MarkdownViewer";
import type { Task } from "../../../../types/taskTypes";

export default function TaskDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  // /projects/[projectId]/task/[taskIndex] を分解
  const pathParts = pathname.split("/");
  const projectId = pathParts[pathParts.length - 3];
  const taskIndexStr = pathParts.pop();
  const taskIndex = parseInt(taskIndexStr ?? "0", 10);

  // TODO: タスクデータをグローバルステート or Context or 再度API呼び出しなどで取得
  // 以下は簡易例として sessionStorage から "cachedTasks" を取得する想定
  let tasks: Task[] = [];
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("cachedTasks");
    if (stored) {
      try {
        tasks = JSON.parse(stored) as Task[];
      } catch (err) {
        console.error("タスクキャッシュのパースエラー:", err);
      }
    }
  }

  const task = tasks[taskIndex] || null;
  if (!task) return <p>タスクが見つかりません。</p>;

  return (
    <div className="p-4">
      <button onClick={() => router.back()} className="px-4 py-2 bg-gray-300 rounded mb-4">
        戻る
      </button>
      <h1 className="text-2xl font-bold mb-2">{task.task_name}</h1>
      <p className="mb-4">優先度: {task.priority}, 担当: {task.assignment || "未定"}</p>
      <h2 className="text-xl font-semibold mb-2">概要:</h2>
      <p className="mb-2">{task.content}</p>

      <h2 className="text-xl font-semibold mb-2">ハンズオン (detail)</h2>
      <MarkdownViewer markdown={task.detail || "*詳細が設定されていません*"} />
    </div>
  );
}
