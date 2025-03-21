"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, Users, ChevronRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [duration, setDuration] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    // 入力内容をひとつのテキストにまとめる
    const promptText = `アイデア: ${idea} 期間: ${duration} 人数: ${numPeople}`;
  
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
      const data: { result: { Question: string } } = await response.json();
  
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
    <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} relative overflow-hidden`}>
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
        className={`absolute top-6 right-6 p-3 rounded-full transition-all z-10 ${
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
      
      <form
        onSubmit={handleSubmit}
        className={`relative z-10 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full border transition-all ${
          darkMode 
            ? 'bg-gray-800 bg-opacity-70 border-cyan-500/30 shadow-cyan-500/20' 
            : 'bg-white bg-opacity-70 border-purple-500/30 shadow-purple-300/20'
        }`}
      >
        <div className="flex items-center justify-center mb-6">
          <Zap className={`mr-2 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
          <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
            プロジェクト<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_コード</span>
          </h1>
        </div>
        
        <div className="mb-5">
          <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            <Zap size={16} className={`mr-2 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} />
            <span>アイデア</span>
          </label>
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="例: 新規SNSアプリを作りたい"
            required
            className={`w-full p-3 rounded border-l-4 focus:outline-none transition-all ${
              darkMode 
                ? 'bg-gray-700 text-gray-100 border-pink-500 focus:ring-1 focus:ring-cyan-400' 
                : 'bg-white text-gray-800 border-blue-500 focus:ring-1 focus:ring-purple-400'
            }`}
          />
        </div>
        
        <div className="mb-5">
          <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            <Clock size={16} className={`mr-2 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} />
            <span>期間</span>
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="例: 2週間"
            required
            className={`w-full p-3 rounded border-l-4 focus:outline-none transition-all ${
              darkMode 
                ? 'bg-gray-700 text-gray-100 border-pink-500 focus:ring-1 focus:ring-cyan-400' 
                : 'bg-white text-gray-800 border-blue-500 focus:ring-1 focus:ring-purple-400'
            }`}
          />
        </div>
        
        <div className="mb-6">
          <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            <Users size={16} className={`mr-2 ${darkMode ? 'text-pink-500' : 'text-blue-600'}`} />
            <span>人数</span>
          </label>
          <input
            type="number"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
            placeholder="例: 3"
            required
            className={`w-full p-3 rounded border-l-4 focus:outline-none transition-all ${
              darkMode 
                ? 'bg-gray-700 text-gray-100 border-pink-500 focus:ring-1 focus:ring-cyan-400' 
                : 'bg-white text-gray-800 border-blue-500 focus:ring-1 focus:ring-purple-400'
            }`}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded transition-all ${
            darkMode 
              ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-900' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? (
            <span className="animate-pulse">処理中...</span>
          ) : (
            <>
              <span>プロジェクト登録</span>
              <ChevronRight size={18} className="ml-2" />
            </>
          )}
        </button>
        
        <div className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <span className={darkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>//
          <span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span> v2.4.7
        </div>
      </form>
    </div>
  );
}