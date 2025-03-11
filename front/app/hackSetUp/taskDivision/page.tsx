"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "../../components/TaskCard";

interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
}

interface DirectoryResponse {
    directory_structure: string;
}

interface TaskResponse {
  tasks: Task[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function TaskDivisionPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectoryAndTasks = async () => {
      if (typeof window === "undefined") return;

      // セッションストレージから仕様書とフレームワーク情報を取得
      const specification = sessionStorage.getItem("specification");
      const framework = sessionStorage.getItem("framework");
      if (!specification || !framework) {
        setError("必要なデータ（仕様書、フレームワーク情報）が見つかりません。");
        setLoading(false);
        return;
      }

      try {
        // まず、ディレクトリ作成APIを呼び出す
        const dirRes = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/directory/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ framework, specification }),
          }
        );
        if (!dirRes.ok) {
          throw new Error("ディレクトリ作成APIエラー: " + dirRes.statusText);
        }
        const dirData: DirectoryResponse = await dirRes.json();
        const directoryText = dirData.directory_structure;
        // ディレクトリ情報をセッションストレージに保存
        sessionStorage.setItem("directory", directoryText);

        await delay(2000);

        // 次に、タスク分割APIを呼び出す
        const tasksRes = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/get_object_and_tasks/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ specification, directory: directoryText, framework }),
          }
        );
        if (!tasksRes.ok) {
          throw new Error("タスク分割APIエラー: " + tasksRes.statusText);
        }
        const tasksData: TaskResponse = await tasksRes.json();
        setTasks(tasksData.tasks);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchDirectoryAndTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">タスク分割</h1>
        {loading ? (
          <p>ロード中...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
