"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SummaryEditor from "../../components/SummaryEditor";
import { Sun, Moon, FileText, Save, ChevronRight, Info } from "lucide-react";


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
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
    router.push("/hackSetUp/selectFramework");
  };
  return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    } p-4 relative overflow-hidden`}>
      {/* アニメーション背景グリッド */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-20' : 'opacity-10'}`}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px), 
                          linear-gradient(90deg, ${darkMode ? '#00ffe1' : '#8a2be2'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '-1px -1px'
        }}></div>
      </div>
      
      {/* テーマ切り替えボタン */}
      <button 
        onClick={toggleDarkMode} 
        className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
        }`}
        aria-label={darkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* 光るエッジライン */}
      <div className="fixed bottom-0 left-0 right-0 h-1 z-20">
        <div className={`h-full ${darkMode ? 'bg-cyan-500' : 'bg-purple-500'} animate-pulse`}></div>
      </div>
      <div className="fixed top-0 bottom-0 right-0 w-1 z-20">
        <div className={`w-full ${darkMode ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`backdrop-blur-lg rounded-xl p-6 shadow-xl border transition-all ${
          darkMode 
            ? 'bg-gray-800 bg-opacity-70 border-cyan-500/30 shadow-cyan-500/20' 
            : 'bg-white bg-opacity-70 border-purple-500/30 shadow-purple-300/20'
        }`}>
          <div className="flex items-center mb-6">
            <FileText className={`mr-3 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={28} />
            <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
              仕様書<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_編集</span>
            </h1>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              {/* サイバーパンク風ローディングアニメーション */}
              <div className="relative w-24 h-24">
                {/* 回転する外側リング */}
                <div className={`absolute inset-0 border-4 border-transparent ${
                  darkMode 
                    ? 'border-t-cyan-500 border-r-pink-400' 
                    : 'border-t-purple-600 border-r-blue-500'
                } rounded-full animate-spin`}></div>
                
                {/* パルスする内側サークル */}
                <div className={`absolute inset-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                  <div className={`w-10 h-10 ${
                    darkMode ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                  } rounded-full animate-ping`}></div>
                </div>
                
                {/* 文字 */}
                <div className={`absolute inset-0 flex items-center justify-center text-xs ${
                  darkMode ? 'text-cyan-400' : 'text-purple-700'
                } font-bold`}>
                  LOADING
                </div>
              </div>
              
              {/* ローディングテキスト */}
              <div className={`mt-6 ${
                darkMode ? 'text-cyan-400' : 'text-purple-700'
              } font-bold tracking-wider flex flex-col items-center`}>
                <p className="text-sm mb-2">仕様書データをロード中...</p>
                <div className="flex space-x-1">
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`}></span>
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></span>
                  <span className={`inline-block w-2 h-2 ${
                    darkMode ? 'bg-pink-500' : 'bg-blue-500'
                  } rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                darkMode 
                  ? 'bg-gray-700 bg-opacity-50 border-pink-500 text-gray-300' 
                  : 'bg-purple-50 border-blue-500 text-gray-700'
              }`}>
                <div className="flex items-center">
                  <Info className={`mr-2 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} size={20} />
                  <p>仕様書を確認し、必要に応じて編集してください。マークダウン形式で記述できます。</p>
                </div>
              </div>
              
              <div className={`rounded-lg border transition-all ${
                darkMode 
                  ? 'bg-gray-700 bg-opacity-50 border-cyan-500/40' 
                  : 'bg-white border-purple-300/40'
              }`}>
                <SummaryEditor 
                  initialSummary={summary} 
                  onSummaryChange={handleSummaryChange}
                  darkMode={darkMode}
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className={`px-8 py-3 flex items-center justify-center rounded-full shadow-lg focus:outline-none transform transition hover:-translate-y-1 ${
                    darkMode 
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-900 focus:ring-2 focus:ring-cyan-400' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white focus:ring-2 focus:ring-purple-400'
                  }`}
                  aria-label="仕様書を保存して次へ進む"
                >
                  <Save size={20} className="mr-2" />
                  <span>仕様書を保存して次へ</span>
                  <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>//
          <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
        </div>

      </div>
    </div>
  );
}
