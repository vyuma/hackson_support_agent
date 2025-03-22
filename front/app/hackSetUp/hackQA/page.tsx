"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "../../components/AnswerText";
import {  ChevronRight, Terminal, Database, Cpu } from "lucide-react";

type Answers = { [key: number]: string };

export default function HackQA() {
  const router = useRouter();
  const [dream, setDream] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(true);
  const processingNext=false
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDream = sessionStorage.getItem("dream");
      // キーを "questionData" で読み込むように修正
      const storedQA = sessionStorage.getItem("questionData");
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
    <div className={`min-h-screen font-mono transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    } relative overflow-hidden`}>
      {/* Animated background grid */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-20' : 'opacity-10'}`}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px), 
                           linear-gradient(90deg, ${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '-1px -1px'
        }}></div>
      </div>
      
      {/* Theme toggle button */}
      <button 
        onClick={toggleDarkMode} 
        className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
        }`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
      
      {/* Glowing edges */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-20">
        <div className={`h-full ${darkMode ? 'bg-cyan-500' : 'bg-purple-500'} animate-pulse`}></div>
      </div>
      <div className="fixed top-0 bottom-0 right-0 w-1 z-20">
        <div className={`w-full ${darkMode ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
      </div>
      {/* mainのカラーを透明にする */}
      
      <main className="relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Terminal className={`mr-2 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
              <h1 className={`text-3xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
                プロジェクト<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_分析</span>
              </h1>
            </div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              以下の質問に回答することで、プロダクトの方向性を明確にしましょう
            </p>
          </div>

          <div className={`backdrop-blur-lg rounded-xl p-8 shadow-xl border transition-all ${
            darkMode 
              ? 'bg-gray-800 bg-opacity-70 border-cyan-500/30 shadow-cyan-500/20' 
              : 'bg-white bg-opacity-70 border-purple-500/30 shadow-purple-300/20'
          }`}>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                  darkMode ? 'border-cyan-500' : 'border-purple-500'
                }`}></div>
                <p className={`mt-4 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
                  データロード中...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className={`text-xl font-medium mb-4 flex items-center ${
                    darkMode ? 'text-cyan-400' : 'text-purple-700'
                  }`}>
                    <Database size={18} className={`mr-2 ${
                      darkMode ? 'text-pink-500' : 'text-blue-600'
                    }`} />
                    あなたの作りたいもの：
                  </h2>
                  <p className={`${
                    darkMode 
                      ? 'bg-gray-700 text-cyan-300' 
                      : 'bg-purple-100 text-gray-800'
                  } p-4 rounded-lg border-l-4 ${
                    darkMode ? 'border-pink-500' : 'border-blue-500'
                  }`}>
                    {dream}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className={`text-xl font-medium mb-4 flex items-center ${
                    darkMode ? 'text-cyan-400' : 'text-purple-700'
                  }`}>
                    <Cpu size={18} className={`mr-2 ${
                      darkMode ? 'text-pink-500' : 'text-blue-600'
                    }`} />
                    以下の質問に回答してください：
                  </h2>
                  <div className="space-y-6">
                    {questions && questions.length > 0 ? (
                      questions.map((question, index) => (
                        <div key={index} className={`p-4 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 bg-opacity-50' 
                            : 'bg-white bg-opacity-80'
                        } transition-all`}>
                          <p className={`mb-3 font-medium ${
                            darkMode ? 'text-pink-300' : 'text-blue-700'
                          }`}>
                            {index + 1}. {question.Question}
                          </p>
                          <textarea
                            value={answers[index] || ""}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder="回答を入力してください..."
                            rows={3}
                            className={`w-full p-3 rounded border-l-4 focus:outline-none transition-all ${
                              darkMode 
                                ? 'bg-gray-800 text-gray-100 border-cyan-500 focus:ring-1 focus:ring-pink-400' 
                                : 'bg-white text-gray-800 border-purple-500 focus:ring-1 focus:ring-blue-400'
                            }`}
                          />
                        </div>
                      ))
                    ) : (
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        質問が読み込めませんでした。もう一度お試しください。
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className={`px-8 py-3 flex items-center rounded-full shadow-lg focus:outline-none transform transition hover:-translate-y-1 ${
                      darkMode 
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-900 focus:ring-2 focus:ring-cyan-400' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white focus:ring-2 focus:ring-purple-400'
                    }`}
                    disabled={questions.length === 0 || processingNext}
                  >
                    {processingNext ? (
                      <div className="flex items-center">
                        <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${
                          darkMode ? 'border-gray-900' : 'border-white'
                        } mr-2`}></div>
                        処理中...
                      </div>
                    ) : (
                      <>
                        <span>次へ進む</span>
                        <ChevronRight size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>
            <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
          </div>
        </div>
      </main>
    </div>
  );
}