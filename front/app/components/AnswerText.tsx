"use client";

import React from "react";

// APIから返される質問オブジェクトの型定義
export interface Question {
  Question: string;
  Answer?: string;
}

interface AnswerTextProps {
  question: Question;
  index: number;
  answer: string;
  handleAnswerChange: (index: number, value: string) => void;
}

// 質問と回答入力欄を表示するコンポーネント
const AnswerText: React.FC<AnswerTextProps> = ({ question, index, answer, handleAnswerChange }) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-xl p-4 shadow-md border border-gray-600 mb-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">
        {question.Question}
      </h3>
      <textarea
        value={answer}
        onChange={(e) => handleAnswerChange(index, e.target.value)}
        placeholder="ここに回答を入力してください"
        rows={4}
        className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-200 bg-gray-900"
      />
    </div>
  );
};

export default AnswerText;
