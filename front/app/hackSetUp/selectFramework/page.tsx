"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FrameworkProposalCard from "../../components/FrameworkProposalCard";

type FrameworkProposal = {
  name: string;
  priority: number;
  reason: string;
};

type FrameworkResponse = {
  frontend: FrameworkProposal[];
  backend: FrameworkProposal[];
};

export default function SelectFrameworkPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<"Web" | "Android" | "iOS">("Web");
  const [frameworkData, setFrameworkData] = useState<FrameworkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFrontend, setSelectedFrontend] = useState<FrameworkProposal | null>(null);
  const [selectedBackend, setSelectedBackend] = useState<FrameworkProposal | null>(null);
  const [specification, setSpecification] = useState<string>("");

  // セッションストレージから仕様書を1度だけ取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const spec = sessionStorage.getItem("specification");
      if (spec) {
        setSpecification(spec);
      } else {
        console.error("仕様書が見つかりません");
        router.push("/");
      }
    }
  }, [router]);

  // specification が取得できたら、API 呼び出しは一度だけ実施（frameworkData が未取得の場合）
  useEffect(() => {
    if (specification && !frameworkData) {
      // ここでプラットフォームに関わらず、仕様書に基づくAPI呼び出しを実施
      setLoading(true);
      fetch(process.env.NEXT_PUBLIC_API_URL + "/api/framework/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specification }),
      })
        .then((res) => res.json())
        .then((data: FrameworkResponse) => {
          // 優先順位（priority：小さいほど高い）順に並べ替え
          data.frontend.sort((a, b) => a.priority - b.priority);
          data.backend.sort((a, b) => a.priority - b.priority);
          setFrameworkData(data);
        })
        .catch((err) => console.error("Framework API エラー:", err))
        .finally(() => setLoading(false));
    }
  }, [specification, frameworkData]);

  const handleConfirm = () => {
    if (platform === "Web") {
      if (!selectedFrontend || !selectedBackend) {
        alert("フロントエンドとバックエンドのフレームワークを選択してください");
        return;
      }
      // 仕様書にフレームワーク情報を追記
      const frameworkInfo = `
                            【フレームワーク選定】
                            フロントエンド: ${selectedFrontend.name}（優先順位: ${selectedFrontend.priority}、理由: ${selectedFrontend.reason}）
                            バックエンド: ${selectedBackend.name}（優先順位: ${selectedBackend.priority}、理由: ${selectedBackend.reason}）
                            `;
      sessionStorage.setItem("framework",frameworkInfo);
    } else {
      
      sessionStorage.setItem("framework", selectedFrontend!.name + selectedBackend!.name);
    }
    router.push("/hackSetUp/taskDivision");
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">フレームワーク選定</h1>
      <div className="mb-4">
        <label className="mr-4 text-gray-800 dark:text-gray-200">プラットフォーム選択:</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as "Web" | "Android" | "iOS")}
          className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="Web">Web</option>
          <option value="Android">Android</option>
          <option value="iOS">iOS</option>
        </select>
      </div>
      {platform === "Web" ? (
        loading ? (
          <p className="text-gray-700 dark:text-gray-300">ロード中...</p>
        ) : (
          frameworkData && (
            <>
              <h2 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">フロントエンド</h2>
              <div className="grid grid-cols-1 gap-4">
                {frameworkData.frontend.map((fw, idx) => (
                  <FrameworkProposalCard
                    key={idx}
                    framework={fw}
                    selected={selectedFrontend?.name === fw.name}
                    onSelect={() => setSelectedFrontend(fw)}
                  />
                ))}
              </div>
              <h2 className="text-xl font-semibold mt-8 text-gray-800 dark:text-gray-200">バックエンド</h2>
              <div className="grid grid-cols-1 gap-4">
                {frameworkData.backend.map((fw, idx) => (
                  <FrameworkProposalCard
                    key={idx}
                    framework={fw}
                    selected={selectedBackend?.name === fw.name}
                    onSelect={() => setSelectedBackend(fw)}
                  />
                ))}
              </div>
            </>
          )
        )
      ) : (
        <div className="mt-4">
          {platform === "Android" && (
            <p className="text-gray-800 dark:text-gray-200">
              Android 向けの開発では、ネイティブアプリ開発が推奨されるため、Web専用のフレームワーク選定情報は表示しません。
            </p>
          )}
          {platform === "iOS" && (
            <p className="text-gray-800 dark:text-gray-200">
              iOS 向けの開発では、ネイティブアプリ開発が推奨されるため、Web専用のフレームワーク選定情報は表示しません。
            </p>
          )}
        </div>
      )}
      <div className="mt-8">
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          決定
        </button>
      </div>
    </div>
  );
}
