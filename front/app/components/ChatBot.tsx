"use client";

import React, { useState } from "react";
import MarkdownViewer from "./MarkdownViewer";

interface ChatBotProps {
  specification: string;
  directoryStructure: string;
  framework: string;
  taskDetail: string;
  isDarkMode: boolean; // 追加
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
  isDarkMode,
}: ChatBotProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState("");

  const handleSend = async () => {
    if (!userQuestion) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userQuestion },
    ];
    setChatHistory(newHistory);

    const requestBody = {
      specification,
      directory_structure: directoryStructure,
      chat_history: newHistory.map((msg) => `${msg.role}:${msg.content}`).join("\n"),
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
        const text = await res.text();
        console.error("ChatBot APIエラー:", text);
        return;
      }
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.response,
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("チャット送信失敗:", err);
    }
  };

  return (
    <div
      className={`mt-8 p-4 border rounded transition-all ${
        isDarkMode
          ? "bg-black border-cyan-500 text-cyan-100"
          : "bg-gray-50 border-blue-300 text-gray-900"
      } shadow-lg`}
    >
      <h2
        className={`text-xl font-semibold mb-2 ${
          isDarkMode ? "text-cyan-400" : "text-blue-600"
        }`}
      >
        サポートチャット
      </h2>

      <div
        className={`mb-4 h-64 overflow-auto p-2 rounded border ${
          isDarkMode
            ? "bg-[#0f0f0f] border-cyan-700"
            : "bg-white border-gray-300"
        }`}
      >
        {chatHistory.map((msg, idx) => (
          <div key={idx} className="mb-3">
            <span
              className={`font-bold ${
                msg.role === "user"
                  ? isDarkMode
                    ? "text-pink-400"
                    : "text-blue-700"
                  : isDarkMode
                  ? "text-green-400"
                  : "text-gray-800"
              }`}
            >

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
          className={`flex-1 border rounded p-2 outline-none transition-all ${
            isDarkMode
              ? "bg-[#1a1a1a] border-cyan-600 text-cyan-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-black"
          }`}
        />
        <button
          onClick={handleSend}
          className={`px-4 py-2 font-bold rounded transition-all ${
            isDarkMode
              ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-black hover:from-pink-400 hover:to-cyan-400"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}

        >
          送信
        </button>
      </div>
    </div>
  );
}
