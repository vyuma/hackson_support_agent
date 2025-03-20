"use client";

import React, { useState } from "react";
import MarkdownViewer from "./MarkdownViewer";

interface ChatBotProps {
  specification: string;
  directoryStructure: string;
  framework: string;
  taskDetail: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot({
  specification,
  directoryStructure,
  framework,
  taskDetail,
}: ChatBotProps) {
  // チャット履歴
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // ユーザーが入力中の質問
  const [userQuestion, setUserQuestion] = useState("");

  // 送信処理
  const handleSend = async () => {
    if (!userQuestion) return;

    // まずローカルのチャット履歴を更新 (ユーザーが発言)
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userQuestion },
    ];
    setChatHistory(newHistory);

    // APIに送るリクエストボディ
    const requestBody = {
      specification,
      directory_structure: directoryStructure,
      chat_history: newHistory.map((msg) => `${msg.role}:${msg.content}`).join("\n"), // シンプルに改行でまとめる等
      user_question: userQuestion,
      framework,
      taskDetail,
    };

    setUserQuestion("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/taskChat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        // エラー処理
        const text = await res.text();
        console.error("ChatBot APIエラー:", text);
        return;
      }
      const data = await res.json();
      // data = { answer: "アシスタントからの回答" } を想定
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.response,
      };
      // チャット履歴に追加
      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("チャット送信失敗:", err);
    }
  };

  return (
    <div className="mt-8 p-4 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">サポートチャット</h2>
      {/* チャット履歴 */}
      <div className="mb-4 h-64 overflow-auto bg-white dark:bg-gray-700 p-2 border dark:border-gray-600 rounded">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-bold text-gray-900 dark:text-white">
              {msg.role === "user" ? "ユーザー" : "アシスタント"}:
            </span>
            <MarkdownViewer markdown={msg.content || ""} />
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="質問を入力..."
          className="flex-1 border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          送信
        </button>
      </div>
    </div>
  );
}
