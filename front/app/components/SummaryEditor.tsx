"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Code, Terminal } from "lucide-react";

interface SummaryEditorProps {
  initialSummary: string;
  onSummaryChange?: (newSummary: string) => void;
  darkMode: boolean;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ initialSummary, onSummaryChange,darkMode }) => {
  const [markdown, setMarkdown] = useState(initialSummary);
  const [expanded, setExpanded] = useState<'editor' | 'preview' | null>(null);
  
  // 行数に基づいて動的に高さを調整
  const [lineCount, setLineCount] = useState(initialSummary.split('\n').length);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);
    // 行数を更新
    setLineCount(newMarkdown.split('\n').length);
    onSummaryChange?.(newMarkdown);
  };

  const toggleExpand = (section: 'editor' | 'preview') => {
    if (expanded === section) {
      setExpanded(null); // 折りたたむ
    } else {
      setExpanded(section); // 展開する
    }
  };

  // 行数に基づいて最小の高さを計算（1行あたり24px + パディング）
  const getMinHeight = () => {
    const minRows = 10; // 最小10行
    const paddingRows = 20; // パディング
    const calculatedRows = Math.max(lineCount + paddingRows, minRows);
    return `${calculatedRows * 24 + 32}px`; // 行高さ + パディング
  };

  return (
    <div className="my-4">
      <div className={`flex gap-4`}>
        {/* 編集パネル */}
        <div className="w-[50%]" >
          <div className={`flex items-center justify-between mb-2 ${
            darkMode ? "text-pink-400" : "text-blue-600"
          }`}>
            <div className="flex items-center">
              <Code size={16} className="mr-2" />
              <span className="font-bold">編集画面</span>
            </div>
            <button 
              onClick={() => toggleExpand('editor')} 
              className={`p-1 rounded hover:bg-opacity-20 ${
                darkMode ? "hover:bg-pink-500" : "hover:bg-blue-500"
              }`}
            >

            </button>
          </div>
          
          <div className="relative">
            <textarea
              value={markdown}
              onChange={handleChange}
              className={`w-full p-4 rounded-md font-mono focus:outline-none transition-all ${
                darkMode
                  ? "bg-gray-800 text-cyan-300 placeholder-gray-500 border border-pink-900 focus:ring-2 focus:ring-pink-500"
                  : "bg-white text-gray-800 border border-purple-200 focus:ring-2 focus:ring-blue-500"
              }`}
              placeholder="// 仕様書を編集できます（マークダウン形式対応）"
              style={{ 
                lineHeight: "1.6",
                minHeight: getMinHeight(),
                backgroundImage: darkMode 
                  ? "linear-gradient(to bottom, rgba(236, 72, 153, 0.05) 1px, transparent 1px)" 
                  : "linear-gradient(to bottom, rgba(147, 51, 234, 0.05) 1px, transparent 1px)",
                backgroundSize: "1px 1.6em",
                backgroundPosition: "0 1.6em"
              }}
            />
            
            <div className={`absolute bottom-2 right-2 opacity-50 text-xs ${
              darkMode ? "text-pink-400" : "text-purple-500"
            }`}>
              <div className="flex items-center">
                <Terminal size={12} className="mr-1" />
                <span>INPUT.sys [{lineCount} 行]</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* プレビューパネル */}
        <div className="w-[50%]" >
          <div className={`flex items-center justify-between mb-2 ${
            darkMode ? "text-cyan-400" : "text-purple-600"
          }`}>
            <div className="flex items-center">
              <Terminal size={16} className="mr-2" />
              <span className="font-bold">出力画面</span>
            </div>
          </div>
          
          <div 
            className={`p-5 rounded-md border-l-4 transition-all overflow-auto ${
              darkMode 
                ? "bg-gray-800 text-gray-200 border-cyan-500 shadow-inner shadow-cyan-900/20" 
                : "bg-white text-gray-800 border-purple-500 shadow-inner shadow-purple-900/10"
            }`}
            style={{ minHeight: getMinHeight() }}
          >
            <div className={`markdown-preview ${
              darkMode ? "cyberpunk-dark" : "cyberpunk-light"
            }`}>
              <style jsx global>{`
                .cyberpunk-dark h1, .cyberpunk-dark h2, .cyberpunk-dark h3, 
                .cyberpunk-dark h4, .cyberpunk-dark h5, .cyberpunk-dark h6 {
                  color: #5eead4;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                  font-weight: bold;
                  border-bottom: 1px solid #0f766e;
                  padding-bottom: 0.3em;
                }
                
                .cyberpunk-dark h1 { font-size: 1.8em; color: #f472b6; }
                .cyberpunk-dark h2 { font-size: 1.5em; }
                .cyberpunk-dark h3 { font-size: 1.3em; }
                
                .cyberpunk-dark p {
                  margin-bottom: 1em;
                  line-height: 1.6;
                }
                
                .cyberpunk-dark ul, .cyberpunk-dark ol {
                  margin-left: 1.5em;
                  margin-bottom: 1em;
                }
                
                .cyberpunk-dark li {
                  margin-bottom: 0.5em;
                }
                
                .cyberpunk-dark a {
                  color: #f472b6;
                  text-decoration: none;
                  border-bottom: 1px dashed #f472b6;
                }
                
                .cyberpunk-dark code {
                  background-color: #1f2937;
                  color: #5eead4;
                  padding: 0.2em 0.4em;
                  border-radius: 3px;
                  font-family: monospace;
                }
                
                .cyberpunk-dark pre {
                  background-color: #1f2937;
                  padding: 1em;
                  border-radius: 5px;
                  overflow: auto;
                  margin-bottom: 1em;
                  border-left: 3px solid #f472b6;
                }
                
                .cyberpunk-light h1, .cyberpunk-light h2, .cyberpunk-light h3, 
                .cyberpunk-light h4, .cyberpunk-light h5, .cyberpunk-light h6 {
                  color: #7c3aed;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                  font-weight: bold;
                  border-bottom: 1px solid #c4b5fd;
                  padding-bottom: 0.3em;
                }
                
                .cyberpunk-light h1 { font-size: 1.8em; color: #3b82f6; }
                .cyberpunk-light h2 { font-size: 1.5em; }
                .cyberpunk-light h3 { font-size: 1.3em; }
                
                .cyberpunk-light p {
                  margin-bottom: 1em;
                  line-height: 1.6;
                }
                
                .cyberpunk-light ul, .cyberpunk-light ol {
                  margin-left: 1.5em;
                  margin-bottom: 1em;
                }
                
                .cyberpunk-light li {
                  margin-bottom: 0.5em;
                }
                
                .cyberpunk-light a {
                  color: #3b82f6;
                  text-decoration: none;
                  border-bottom: 1px dashed #3b82f6;
                }
                
                .cyberpunk-light code {
                  background-color: #f3f4f6;
                  color: #7c3aed;
                  padding: 0.2em 0.4em;
                  border-radius: 3px;
                  font-family: monospace;
                }
                
                .cyberpunk-light pre {
                  background-color: #f3f4f6;
                  padding: 1em;
                  border-radius: 5px;
                  overflow: auto;
                  margin-bottom: 1em;
                  border-left: 3px solid #3b82f6;
                }
              `}</style>
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`mt-4 text-xs ${
        darkMode ? "text-gray-500" : "text-gray-600"
      }`}>
        <div className="flex items-center">
          <Terminal size={12} className="mr-1 inline" />
          <span>マークダウン形式で書かれた仕様書は、プロジェクト開発時に自動的に参照されます。各パネルは拡大ボタンで展開できます。</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryEditor;