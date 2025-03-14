"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "../../components/TaskCard";

interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  // detail は UI には表示せず、API呼び出し結果としてセッションストレージに保存するだけ
  detail?: string;
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
        // タスク情報をセッションストレージに保存
        sessionStorage.setItem("taskRes", JSON.stringify(tasksData));
        // UI には詳細なしのタスクリストを表示する
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

  // タスクが読み込まれたら非同期でタスク詳細化APIを呼び出し、
  // 結果はセッションストレージに保存する（UIには反映しない）
  useEffect(() => {
    if (tasks.length > 0) {
      console.log("タスク詳細化APIを呼び出します");
      const fetchTaskDetails = async () => {
        try {
          // タスク情報をセッションストレージから呼び出す
          const taskResp = JSON.parse(sessionStorage.getItem("taskRes") || "");
          
          console.log("tasks:", taskResp);
          await delay(2000);

          const res = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/api/taskDetail/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify((taskResp)),
            }
          );
          if (!res.ok) {
            throw new Error("タスク詳細化APIエラー: " + res.statusText);
          }
          const data = await res.json();
          // 詳細付きタスクをセッションストレージに保存（UI の tasks には影響しない）
          sessionStorage.setItem("detailedTasks", JSON.stringify(data.tasks));
        } catch (err: any) {
          console.error("TaskDetail API エラー:", err);
        }
      };
      fetchTaskDetails();
    }
  }, [tasks]);

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
    } catch (err: any) {
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
