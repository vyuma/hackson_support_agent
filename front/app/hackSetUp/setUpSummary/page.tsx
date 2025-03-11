"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SummaryEditor from "../../components/SummaryEditor";
import { GSP_NO_RETURNED_VALUE } from "next/dist/lib/constants";

interface QAItem {
  Question: string;
  Answer: string;
}

interface YumeAnswerRequest {
    yume_answer: {
      Answer: QAItem[];
    };
  }  

export default function SetUpSummaryPage() {
  const router = useRouter();
  const [qaData, setQaData] = useState<YumeAnswerRequest | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // sessionStorage から Q&A 回答情報を取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedQA = sessionStorage.getItem("answers");
      if (storedQA) {
        try {
          const parsedQA: YumeAnswerRequest = JSON.parse(storedQA);
          console.log("セッションストレージから読み込んだQ&Aデータ:", parsedQA);
          setQaData(parsedQA);
        } catch (error) {
          console.error("Q&Aデータのパースエラー:", error);
        }
      } else {
        // Q&A情報がなければホームに戻る
        router.push("/");
      }
    }
  }, [router]);

  // Q&Aデータが取得できたら summary API を呼び出す
    useEffect(() => {

    if (qaData == null) return;
    if (qaData.yume_answer &&
        Array.isArray(qaData.yume_answer.Answer) &&
        qaData.yume_answer.Answer.length > 0
        ) {
        const fetchSummary = async () => {
        setLoading(true);
        try {
            // hackQAで整形したデータをそのままAPIに送る
            const requestBody = qaData.yume_answer;
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/yume_summary/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            });
            const summaryText = await res.json();
            setSummary(summaryText.summary);
        } catch (error) {
            console.error("summary API 呼び出しエラー:", error);
        } finally {
            setLoading(false);
        }
        };
        fetchSummary();
        }else{
            console.error("Q&Aデータが不正です");
        }
    }, [qaData]);


  const handleSummaryChange = (newSummary: string) => {
    setSummary(newSummary);
    console.log("newSummary:", newSummary);
  };

  const handleSave = () => {
    // 編集後の仕様書を sessionStorage に保存
    sessionStorage.setItem("specification", summary);
    alert("仕様書が保存されました");
    router.push("/hackSetUp/selectFramework");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">仕様書の確認と編集</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <SummaryEditor initialSummary={summary} onSummaryChange={handleSummaryChange} />
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              仕様書を保存
            </button>
          </>
        )}
      </div>
    </div>
  );
}
