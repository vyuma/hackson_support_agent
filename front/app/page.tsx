"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [duration, setDuration] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 入力内容をひとつのテキストにまとめる
    const promptText = `アイデア: ${idea} 期間: ${duration} 人数: ${numPeople}`;

    sessionStorage.setItem("idea", idea);
    sessionStorage.setItem("duration", duration);
    sessionStorage.setItem("numPeople", numPeople);
    
    try {
      // API呼び出し（バックエンドの /api/yume_question にPOST）
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/yume_question/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // バックエンドの Pydantic モデルに合わせ、キーは "Prompt"
        body: JSON.stringify({ Prompt: promptText }),
      });
      console.log("API response:", response);
      const data = await response.json();

      const formattedData = {
        yume_answer: {
          Answer: data.result.Question,
        },
      }

      // sessionStorage にアイデアと質問データを保存
      sessionStorage.setItem("dream", idea);
      sessionStorage.setItem("questionData", JSON.stringify(formattedData));
      
      // 質問＆回答入力ページへ遷移
      router.push("/hackSetUp/hackQA");
    } catch (error) {
      console.error("API呼び出しエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">プロジェクト設定</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">アイデア</label>
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="例: 新規SNSアプリを作りたい"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">期間</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="例: 2週間"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">人数</label>
          <input
            type="number"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
            placeholder="例: 3"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "送信中..." : "送信"}
        </button>
      </form>
    </div>
  );
}
