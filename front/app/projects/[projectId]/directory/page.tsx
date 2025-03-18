"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarkdownViewer from "../../../components/MarkdownViewer";
import ChatBot from "../../../components/ChatBot";

export default function DirectoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const projectId = pathParts[pathParts.length - 2];

  // ディレクトリ構造を表示するための文字列
  const [directoryStructure, setDirectoryStructure] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");   // 実際の仕様書
  const [framework, setFramework] = useState<string>("");           // 実際のFW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // チャットbot用のダミーtaskDetail
  const dummyTaskDetail = "ディレクトリ確認のページなので、特にタスク詳細は不要";

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("プロジェクトIDが指定されていません");
      return;
    }

    // プロジェクト情報をGETし、directory_infoを表示
    const fetchProject = async () => {
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

        // ディレクトリ構造 (例: data.directory_info)
        setDirectoryStructure(data.directory_info || "");
        // 仕様書
        setSpecification(data.specification || "");
        // フレームワーク
        setFramework(data.selected_framework || "");
      } catch (err: unknown) {
        console.error("プロジェクト情報取得エラー:", err);
        const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown error occurred';
        alert("DBへの登録に失敗しました: " + errorMessage);
        setError("プロジェクト情報の取得に失敗しました");
        
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <button onClick={() => router.back()} className="px-4 py-2 bg-gray-300 rounded mb-4">
        戻る
      </button>

      <h1 className="text-2xl font-bold mb-4">ディレクトリ表示</h1>
      <section className="mb-6">
        <MarkdownViewer markdown={directoryStructure} />
      </section>

      {/* チャットボット: タスク詳細は不要なのでダミーデータを渡す */}
      <ChatBot
        specification={specification}
        directoryStructure={directoryStructure}
        framework={framework}
        taskDetail={dummyTaskDetail}
      />
    </div>
  );
}
