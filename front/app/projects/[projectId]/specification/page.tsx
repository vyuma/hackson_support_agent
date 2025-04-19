"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {AlertTriangle,Sun ,Moon ,ArrowLeft} from "lucide-react";

import MarkdownViewer from "@/components/MarkdownViewer";
import Loading from "@/components/Loading";

export default function SpecificationPage() {
    const [specification, setSpecification] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [darkMode, setDarkMode] = useState(true);
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    }



    const router = useRouter();
    const pathname = usePathname();
    const pathParts = pathname.split("/");
    // URL: /projects/[projectId]/envHanson のイメージ
    // projectIdは pathParts の最終要素の1つ手前
    const projectId = pathParts[pathParts.length - 2];


    useEffect(() => {
    if (!projectId) {
        setError("プロジェクトIDが指定されていません");
        setLoading(false);
        return;
    }

    const fetchProject = async () => {
        try {
        // プロジェクト情報を取得
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
            );
            if (!res.ok) {
            console.error("プロジェクト情報取得失敗:", res.statusText);
            setError("プロジェクト情報の取得に失敗しました");
            return;
            }
            const data = await res.json();

        // data.envHanson は JSON文字列 {"overall":"...","devcontainer":"...","frontend":"...","backend":"..."} の想定
        if (data.specification) {
            try {
            const parsedSpecification = data.specification as string;
            setSpecification(parsedSpecification);

            console.log("parsedSpecification keys:", Object.keys(parsedSpecification));

            } catch (parseErr:unknown) {
            console.error("specificatrionのパースエラー:", parseErr);
            setSpecification("取得出来ませんでした");
            }
        } else {
            setSpecification("取得できませんでした");
        }

        } catch (err: unknown) {
        console.error("プロジェクト情報取得エラー:", err);
        setError("プロジェクト情報の取得に失敗しました");
        } finally {
        setLoading(false);
        }
    };

    fetchProject();
    }, [projectId]);


if (loading) {
    return (
        <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
        {/* サイバーパンク風ローディングアニメーション */}
        <Loading darkMode={darkMode} />
        </div>
    );
    }

    if (error) {
    return (
        <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
        <div className={`p-6 rounded-lg max-w-md ${
            darkMode 
            ? 'bg-red-900/30 border border-red-700 text-red-300' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
            <div className="flex items-center mb-2">
            <AlertTriangle className="mr-2" size={20} />
            <h3 className="font-bold">エラーが発生しました</h3>
            </div>
            <p>{error}</p>
        </div>
        </div>
    );
    }

    return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
        {/* アニメーション背景グリッド */}
        <div className={`fixed inset-0 overflow-hidden pointer-events-none ${darkMode ? 'opacity-10' : 'opacity-5'}`}>
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
            className={`fixed top-6 right-6 p-3 rounded-full transition-all z-30 ${
            darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
            }`}
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    
        {/* ヘッダー */}
        <header className={`p-4 md:p-6 transition-all duration-300 z-10 relative ${
            darkMode 
            ? 'bg-gray-800/80 border-b border-cyan-800/50 shadow-lg shadow-cyan-900/20' 
            : 'bg-white/80 backdrop-blur-sm border-b border-purple-200 shadow-lg shadow-purple-200/20'
        }`}>
            <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <button 
                onClick={() => router.back()} 
                className={`px-4 py-2 rounded-md flex items-center transition-all ${
                    darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-900' 
                    : 'bg-gray-200 hover:bg-gray-300 text-purple-700 border border-purple-200'
                }`}
                >
                <ArrowLeft size={16} className="mr-2" />
                戻る
                </button>
                <h1 className={`text-2xl font-bold tracking-wider ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
                仕様書<span className={darkMode ? 'text-pink-500' : 'text-blue-600'}>_確認</span>
                </h1>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                プロジェクトID: {projectId}
                </div>
            </div>
            </div>
        </header>

        {/* MarkdonwViewer */}
        <div className={`max-w-5xl mx-auto relative z-10`}>
            
            <MarkdownViewer markdown={specification} />
            </div>
        </div>
    )
    

}