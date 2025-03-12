"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownViewer from "../../components/MarkdownViewer";

interface EnvHandsOn {
  overall: string;
  devcontainer: string;
  frontend: string;
  backend: string;
}

export default function EnvHandsOnPage() {
  const router = useRouter();
  const [envData, setEnvData] = useState<EnvHandsOn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEnv = sessionStorage.getItem("envHandsOn");
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

  const handleBack = () => {
    router.push("/hackson/hackTask");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">環境構築ハンズオン</h1>
        {loading ? (
          <p>ロード中...</p>
        ) : envData ? (
          <>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">全体のハンズオン説明</h2>
              <MarkdownViewer markdown={envData.overall} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">.devcontainer の設定</h2>
              <MarkdownViewer markdown={envData.devcontainer} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">フロントエンド環境構築</h2>
              <MarkdownViewer markdown={envData.frontend} />
            </section>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">バックエンド環境構築</h2>
              <MarkdownViewer markdown={envData.backend} />
            </section>
          </>
        ) : (
          <p>環境構築情報が見つかりません。</p>
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
