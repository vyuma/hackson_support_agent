"use client";

import React, { useEffect, useState } from "react";
import { useRouter,usePathname} from "next/navigation";
import MarkdownViewer from "@/components/MarkdownViewer"
import { AlertTriangle, Sun, Moon, ArrowLeft } from "lucide-react";

import { requestBodyType } from "@/types/taskTypes"; 



type DeployInfo = {
    deploy : string;
}

export default function DeployPage(){
    const [darkMode, setDarkMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [project, setProject] = useState<requestBodyType>(
        {
            idea: "",
            duration: "",
            num_people: 0,
            specification: "",
            selected_framework: "",
            directory_info: "",
            menber_info: [],
            task_info: [],
            envHanson: "",
        } as requestBodyType
    );
    const [specification, setSpecification] = useState<string>("");   // 実際の仕様書
    const [framework, setFramework] = useState<string>("");           // 実際のFW
    const [deployInfo, setDeployInfo] = useState<string>("");
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
      };  
    const router = useRouter();
    const pathname = usePathname();
    const pathParts = pathname.split("/");
    // URL: /projects/[projectId]/envHanson のイメージ
    // projectIdは pathParts の最終要素の1つ手前
    const projectId = pathParts[pathParts.length - 2];
    
    useEffect(() => {
        const loadProject = async () => {

          const projectRow = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/projects/" + projectId,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
          )
          if (!projectRow.ok) {
            setLoading(false);

            setError("プロジェクト情報の取得に失敗しました");
            return;
          }
            const projectJSON:requestBodyType = await projectRow.json();
            if (!projectJSON) {
                setLoading(false);
                setError("プロジェクト情報が存在しません");
                return;
            }
            setProject(projectJSON);
            // projectの中身を確認する
            console.log("プロジェクト情報:", project);
            setSpecification(project.specification || "");
            setFramework(project.selected_framework || "");

            const responseBody = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/deploy/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        framework: framework,
                        specification: specification, 
                    }),
                }
            )
            if (!responseBody.ok) {
                throw new Error("デプロイ情報の取得に失敗しました");
            }
            const deployInfoJSON:DeployInfo = await responseBody.json();
            console.log("デプロイ情報JSON:", deployInfoJSON);
            // デプロイ情報を取得する
            const deployInfoData = deployInfoJSON.deploy;
            setDeployInfo(deployInfoData);
            setLoading(false);
            console.log("デプロイ情報:", deployInfoData);
        };
        loadProject();
        },[]);



    if (loading) {
    return (
        <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
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
                  
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    プロジェクトID: {projectId}
                  </div>
                </div>
              </div>
            </header>

            {/* メインコンテンツ */}
            <main className={`container mx-auto p-4 md:p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-900/50 text-gray-100' 
                : 'bg-white/50 text-gray-900'
            }`}>
              <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-cyan-400' : 'text-purple-700'}`}>
                デプロイ情報
              </h1>
              <div className="prose">
                <MarkdownViewer markdown={deployInfo} isDarkMode={darkMode} />
              </div>
            <div/>
            </main>
        </div>
    );


}