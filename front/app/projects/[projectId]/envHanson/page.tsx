"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../components/MarkdownViewer";
import ChatBot from "../../../components/ChatBot";

interface EnvHansonData {
  overall?: string;
  devcontainer?: string;
  frontend?: string;
  backend?: string;
}

export default function EnvHansonPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  // URL: /projects/[projectId]/envHanson のイメージ
  // projectIdは pathParts の最終要素の1つ手前
  const projectId = pathParts[pathParts.length - 2];

  // 環境構築情報 (パース後)
  const [envData, setEnvData] = useState<EnvHansonData | null>(null);

  // 仕様書・ディレクトリ構造・フレームワークなど
  const [specification, setSpecification] = useState("");
  const [directoryStructure, setDirectoryStructure] = useState("");
  const [framework, setFramework] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setError("プロジェクトIDが指定されていません");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        // プロジェクト情報を取得
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

        // data.envHanson は JSON文字列 {"overall":"...","devcontainer":"...","frontend":"...","backend":"..."} の想定
        if (data.envHanson) {
          try {
            const parsedEnv = JSON.parse(data.envHanson) as EnvHansonData;
            setEnvData(parsedEnv);

            console.log("parsedEnv keys:", Object.keys(parsedEnv));

          } catch (parseErr) {
            console.error("envHansonのパースエラー:", parseErr);
            setEnvData(null);
          }
        } else {
          setEnvData(null);
        }

        // 仕様書やフレームワークなど必要に応じて取得
        setSpecification(data.specification || "");
        setFramework(data.selected_framework || "");
        setDirectoryStructure(data.directory_info || "");
      } catch (err: unknown) {
          // エラーオブジェクトかどうかを確認し、適切にメッセージを抽出
          const errorMessage = err instanceof Error 
          ? err.message 
          : 'Unknown error occurred';
          
          alert("DBへの登録に失敗しました: " + errorMessage);
          setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <p>ロード中...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <button onClick={() => router.back()} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded mb-4 hover:bg-gray-400 dark:hover:bg-gray-600 transition">
        戻る
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">環境構築ハンズオン</h1>

      {envData ? (
        <>
          {/* 全体のハンズオン */}
          {envData.overall && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">全体のハンズオン</h2>
              <MarkdownViewer markdown={envData.overall} />
            </section>
          )}
          {/* devcontainer */}
          {envData.devcontainer && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">.devcontainer の設定</h2>
              <MarkdownViewer markdown={envData.devcontainer} />
            </section>
          )}
          {/* フロントエンド */}
          {envData.frontend && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">フロントエンド環境構築</h2>
              <MarkdownViewer markdown={envData.frontend} />
            </section>
          )}
          {/* バックエンド */}
          {envData.backend && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">バックエンド環境構築</h2>
              <MarkdownViewer markdown={envData.backend} />
            </section>
          )}
        </>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">環境構築情報が見つかりません。</p>
      )}

      {/* タスク詳細は不要なのでダミー文字列を使用 */}
      <ChatBot
        specification={specification}
        directoryStructure={directoryStructure}
        framework={framework}
        // taskDetailは環境構築ハンズオンの文字列全てを渡す
        taskDetail = {(envData?.overall || "") + envData?.devcontainer + envData?.frontend + envData?.backend}
      />
    </div>
  );
}
