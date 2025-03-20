"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownViewer from "../../components/MarkdownViewer";
import { Task } from "../../types/taskTypes";

interface EnvHandsOn {
  overall: string;
  devcontainer: string;
  frontend: string;
  backend: string;
}

type requestBodyType = {
  idea: string;
  duration: string;
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  menber_info: string[];
  task_info: string[];
  envHanson: string;
}

export default function EnvHandsOnPage() {
  const router = useRouter();
  const [envData, setEnvData] = useState<EnvHandsOn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEnv = sessionStorage.getItem("envHanson");
      if (storedEnv) {
        try {
          const parsedEnv: EnvHandsOn = JSON.parse(storedEnv);
          setEnvData(parsedEnv);
        } catch (err) {
          console.error("環境構築データのパースエラー:", err);
        }
      }
      setLoading(false);
    }
  }, []);

  /**
   * DB への POST を行う関数
   * - 成功時は { project_id, message } を受け取り、project_id を返す
   */
  const postToDB = async (reqBody: requestBodyType): Promise<string> => {
    console.log("DBへプロジェクト情報をポストします:", reqBody);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/projects",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      }
    );
    if (!res.ok) {
      throw new Error("DB POSTエラー: " + res.statusText);
    }
    const data = await res.json();
    console.log("DBレスポンス:", data);
    // data = { project_id: "...", message: "..." }
    return data.project_id;
  };

  /**
   * - detailedTasks が取得できるまで待機（最大30秒）
   * - セッションストレージから他の必要データも取得
   * - POST ボディを組み立てて DB へ送信
   * - 返却された project_id をもとに `/projects/${project_id}` へ遷移
   */
  const handleBack = async () => {
    let detailedTasks = sessionStorage.getItem("detailedTasks");
    let attempts = 0;
    while (!detailedTasks && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      detailedTasks = sessionStorage.getItem("detailedTasks");
      attempts++;
    }
    if (!detailedTasks) {
      alert("タスク詳細の取得に失敗しました。しばらく待ってから再度お試しください。");
      return;
    }

    // セッションストレージから各種データを取得
    const dream = sessionStorage.getItem("dream");         // アイデア
    const duration = sessionStorage.getItem("duration");   // 期間
    const numPeople = sessionStorage.getItem("numPeople"); // 人数
    const specification = sessionStorage.getItem("specification");
    const framework = sessionStorage.getItem("framework");
    const directory = sessionStorage.getItem("directory");
    // tasks は詳細なしのタスクリスト
    const tasks = sessionStorage.getItem("tasks");
    const envHanson = sessionStorage.getItem("envHanson");  // 環境構築ハンズオン

    if (!dream || !duration || !numPeople || !specification || !framework || !directory || !tasks || !envHanson) {
      alert("プロジェクト情報が不足しています。");
      return;
    }


    // detailedTasks を配列にパース
    const detailedTasksArray:Task[] = JSON.parse(detailedTasks);

    // 各タスクに assignment, ID プロパティを追加
    const tasksWithAssignment = detailedTasksArray.map((task,index: number) => ({
      ...task,
      assignment: task.assignment ?? "",
      task_id: index,
    }));

    // DB に送る際、task_info は string[] を想定 ⇒ 各タスクを JSON.stringify して入れるなど方法は任意
    // ここでは各 detailTask オブジェクトをまとめて string 化
    const taskInfoStrings = tasksWithAssignment.map((taskObj) => JSON.stringify(taskObj));

    // 人数分のメンバーの文字列の配列を作成
    const members = Array.from({ length: parseInt(numPeople) }, () => "menber" + Math.floor(Math.random() * 1000));

    // DB に送るリクエストボディを組み立て
    // (仕様書に沿う形)
    const requestBody = {
      idea: dream,
      duration: duration,
      num_people: parseInt(numPeople, 10),
      specification: specification,
      selected_framework: framework,
      directory_info: directory,
      menber_info: members,
      task_info: taskInfoStrings,
      envHanson: envHanson,
    };

    try {
      const projectId = await postToDB(requestBody);
      router.push(`/projects/${projectId}`);
    } catch (err: unknown) {
      console.error(err);
      console.error(err);
      // エラーオブジェクトかどうかを確認し、適切にメッセージを抽出
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown error occurred';
        
      alert("DBへの登録に失敗しました: " + errorMessage);
    }
  };

  return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded shadow dark:shadow-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">環境構築ハンズオン</h1>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">ロード中...</p>
        ) : envData ? (
          <>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">全体のハンズオン説明</h2>
              <MarkdownViewer markdown={envData.overall} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">.devcontainer の設定</h2>
              <MarkdownViewer markdown={envData.devcontainer} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">フロントエンド環境構築</h2>
              <MarkdownViewer markdown={envData.frontend} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">バックエンド環境構築</h2>
              <MarkdownViewer markdown={envData.backend} />
            </section>
          </>
        ) : (
          <p className="text-gray-800 dark:text-gray-200">環境構築情報が見つかりません。</p>
        )}
      </div>
      <div className="mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          コーディングを始める！
        </button>
      </div>
    </div>
  );
}
