"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "../../components/TaskCard";

interface Task {
  task_name: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  // detail は UI には表示せず、API呼び出し結果としてセッションストレージに保存するだけ
  detail?: string;
}


type TaskDetail = {
  tasks: Task[];
}

interface DirectoryResponse {
  directory_structure: string;
}

interface TaskResponse {
  tasks: Task[];
}

export default function TaskDivisionPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetchDirectoryAndTasks が既に呼ばれたかどうかのフラグ
  const hasFetchedRef = useRef(false);

  // 初回ロード時に、ディレクトリ作成APIとタスク分割APIを呼び出す
  const fetchTaskDivision = async () => {
    if (typeof window === "undefined") return;

    // セッションストレージから仕様書とフレームワーク情報を取得
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    if (!specification || !framework) {
      setError("必要なデータ（仕様書、フレームワーク情報）が見つかりません。");
      setLoading(false);
      return;
    }

    // ディレクトリ作成APIを呼び出す
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

    // タスク分割APIを呼び出す
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
    // タスク情報をセッションストレージに保存
    sessionStorage.setItem("taskRes", JSON.stringify(tasksData));
    // UI には詳細なしのタスクリストを表示する
    setTasks(tasksData.tasks);
  };

  // ディレクトリ作成APIは呼び出さず、タスク分割APIのみを呼び出す関数
  const fetchTaskDivisionOnly = async () => {
    if (typeof window === "undefined") return;
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    const directory = sessionStorage.getItem("directory");
    if (!specification || !framework || !directory) {
      setError("必要なデータ（仕様書、フレームワーク情報、ディレクトリ）が見つかりません。");
      setLoading(false);
      return;
    }
    const tasksRes = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/get_object_and_tasks/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specification, directory, framework }),
      }
    );
    if (!tasksRes.ok) {
      throw new Error("タスク分割APIエラー: " + tasksRes.statusText);
    }
    const tasksData: TaskResponse = await tasksRes.json();
    sessionStorage.setItem("taskRes", JSON.stringify(tasksData));
    setTasks(tasksData.tasks);
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchDirectoryAndTasks = async () => {
      try {
        await fetchTaskDivision();
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
        setError(errorMessage);

      } finally {
        setLoading(false);
      }
    };

    fetchDirectoryAndTasks();
  }, []);
// タスク詳細APIの呼び出し（422の場合、タスク分割APIのみ再実行）
const fetchTaskDetails = useCallback(async (retryCount: number = 0) => {
  try {
    const taskResp = JSON.parse(sessionStorage.getItem("taskRes") || "");
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/taskDetail/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskResp),
      }
    );
    if (res.status === 422 && retryCount < 3) {
      console.warn(
        `タスク詳細APIが422を返しました。タスク分割APIのみ再実行します。（再試行 ${retryCount + 1} 回目）`
      );
      // タスク分割APIのみの再実行
      await fetchTaskDivisionOnly();
      // 再度タスク詳細化APIを呼び出す
      return await fetchTaskDetails(retryCount + 1);
    }
    if (!res.ok) {
      throw new Error("タスク詳細化APIエラー: " + res.statusText);
    }
    const data:TaskDetail = await res.json();
    // 詳細付きタスクをセッションストレージに保存（UI の tasks には影響しない）
    sessionStorage.setItem("detailedTasks", JSON.stringify(data.tasks));
  } catch (err: unknown) {
    console.error("TaskDetail API エラー:", err);
  }
}, [fetchTaskDivisionOnly]); // fetchTaskDivisionOnly を依存関係に追加

useEffect(() => {
  if (tasks.length > 0) {
    console.log("タスク詳細化APIを呼び出します");
    fetchTaskDetails();
  }
}, [tasks, fetchTaskDetails]);

  // 環境構築ハンズオンAPI呼び出し＆遷移処理
  const handleProceedToEnv = async () => {
    // タスク内容（非詳細版）をセッションストレージに保存
    sessionStorage.setItem("tasks", JSON.stringify(tasks));

    // 仕様書、フレームワーク、ディレクトリ情報を取得
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    const directory = sessionStorage.getItem("directory");

    if (!specification || !framework || !directory) {
      alert("必要なデータが不足しています。");
      return;
    }

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/environment/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specification, directory, framework }),
        }
      );
      if (!res.ok) {
        throw new Error("環境構築APIエラー: " + res.statusText);
      }
      const envData = await res.json();
      // envDataは { overall: string, devcontainer: string, frontend: string, backend: string } を想定
      sessionStorage.setItem("envHanson", JSON.stringify(envData));
      router.push("/hackSetUp/envHanson");
    } catch (err: unknown) {
      console.error(err);
      alert("環境構築APIの呼び出しに失敗しました");
    }
  };

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
        <div className="mt-8">
          <button
            onClick={handleProceedToEnv}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            確認 環境構築ハンズオンに進む
          </button>
        </div>
      </div>
    </div>
  );
}
