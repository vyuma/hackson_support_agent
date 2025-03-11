"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnswerText, { Question } from "../../components/AnswerText";

type Answers = { [key: number]: string };

export default function HackQA() {
  const router = useRouter();
  const [dream, setDream] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(true);
  const [processingNext, setProcessingNext] = useState(false);
  const [dreamAnalysis, setDreamAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDream = sessionStorage.getItem("dream");
      // キーを "answers" で読み込むように修正
      const storedQA = sessionStorage.getItem("answers");
      if (storedDream) {
        setDream(storedDream);
        if (storedQA) {
          try {
            const data = JSON.parse(storedQA);
            console.log("セッションストレージから読み込んだQ&Aデータ:", data);
            // 期待する形式は { yume_answer: { Answer: [...] } } となる
            if (data && data.yume_answer && Array.isArray(data.yume_answer.Answer)) {
              setQuestions(data.yume_answer.Answer);
              // 初期回答をセット（各オブジェクトの Answer 値を利用）
              const initialAnswers: { [key: number]: string } = {};
              data.yume_answer.Answer.forEach((q: { Question: string; Answer: string }, index: number) => {
                initialAnswers[index] = q.Answer || "";
              });
              setAnswers(initialAnswers);
            } else {
              console.error("予期しないデータ形式:", data);
            }
          } catch (e) {
            console.error("JSONパースエラー:", e);
          }
        } else {
          console.error("Q&Aデータがセッションストレージにありません");
        }
        setLoading(false);
      } else {
        console.log("アイデアがセッションストレージにないため、ホームに戻ります");
        router.push("/");
      }
    }
  }, [router]);
  
  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const formattedQA = {
        yume_answer: {
          Answer: questions.map((q, index) => ({
            Question: q.Question,
            Answer: answers[index],
          })),
        },
    };
    sessionStorage.setItem("answers", JSON.stringify(formattedQA));
      
    console.log("formattedQA:", formattedQA);
    // 画面遷移
    router.push("/hackSetUp/setUpSummary");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">あなたの作りたいものを深掘りします</h1>
            <p className="text-lg text-purple-100">
              以下の質問に回答することで、プロダクトの方向性を明確にしましょう
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-purple-300 border-opacity-20">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-700 mb-4">あなたの作りたいもの：</h2>
                  <p className="text-purple-100 bg-purple-800 bg-opacity-30 p-4 rounded-lg">{dream}</p>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-700 mb-4">
                    以下の質問に回答してください：
                  </h2>
                  <div className="space-y-4">
                    {questions && questions.length > 0 ? (
                      questions.map((question, index) => (
                        <AnswerText
                          key={index}
                          question={question}
                          index={index}
                          answer={answers[index] || ""}
                          handleAnswerChange={handleAnswerChange}
                        />
                      ))
                    ) : (
                      <p className="text-white">
                        質問が読み込めませんでした。もう一度お試しください。
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform transition hover:-translate-y-1"
                    disabled={questions.length === 0 || processingNext}
                  >
                    {processingNext ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        処理中...
                      </div>
                    ) : (
                      "次へ進む"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
