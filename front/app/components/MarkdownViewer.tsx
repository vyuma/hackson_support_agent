import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, coy } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownViewerProps {
  markdown: string;
  isDarkMode?: boolean;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown, isDarkMode = true }) => {
  return (
    <div className={`markdown-content ${isDarkMode ? 'cyberpunk-dark' : 'cyberpunk-light'}`}>
      <style jsx global>{`
        .cyberpunk-dark h1, .cyberpunk-dark h2, .cyberpunk-dark h3,
        .cyberpunk-dark h4, .cyberpunk-dark h5, .cyberpunk-dark h6 {
          color: #5eead4;
          margin-top: 1.5em;
          margin-bottom: 0.8em;
          font-weight: bold;
          border-bottom: 1px solid #0f766e;
          padding-bottom: 0.3em;
        }
        
        .cyberpunk-dark h1 { font-size: 1.8em; color: #f472b6; }
        .cyberpunk-dark h2 { font-size: 1.5em; }
        .cyberpunk-dark h3 { font-size: 1.3em; }
        
        .cyberpunk-dark p {
          margin-bottom: 1em;
          line-height: 1.7;
        }
        
        .cyberpunk-dark a {
          color: #f472b6;
          text-decoration: none;
          border-bottom: 1px dashed #f472b6;
          transition: all 0.3s ease;
        }
        
        .cyberpunk-dark a:hover {
          color: #5eead4;
          border-bottom-color: #5eead4;
        }
        
        .cyberpunk-dark strong {
          color: #5eead4;
          font-weight: bold;
        }
        
        .cyberpunk-dark em {
          color: #f472b6;
          font-style: italic;
        }
        
        .cyberpunk-dark blockquote {
          border-left: 4px solid #5eead4;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: #a3a3a3;
        }
        
        .cyberpunk-dark hr {
          border: 0;
          height: 1px;
          background: linear-gradient(to right, #f472b6, #5eead4);
          margin: 2em 0;
        }
        
        .cyberpunk-dark ul, .cyberpunk-dark ol {
          margin-left: 2em;
          margin-bottom: 1em;
        }
        
        .cyberpunk-dark li {
          margin-bottom: 0.5em;
          position: relative;
        }
        
        .cyberpunk-dark ul > li::before {
          content: "»";
          color: #f472b6;
          position: absolute;
          left: -1.5em;
        }
        
        .cyberpunk-dark ol {
          counter-reset: item;
        }
        
        .cyberpunk-dark ol > li {
          counter-increment: item;
        }
        
        .cyberpunk-dark ol > li::before {
          content: counter(item);
          color: #5eead4;
          position: absolute;
          left: -1.5em;
          font-weight: bold;
        }
        
        .cyberpunk-dark table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
        }
        
        .cyberpunk-dark th {
          background-color: #1f2937;
          color: #5eead4;
          padding: 0.75em;
          border-bottom: 2px solid #5eead4;
          text-align: left;
        }
        
        .cyberpunk-dark td {
          padding: 0.75em;
          border-bottom: 1px solid #374151;
        }
        
        .cyberpunk-dark tr:last-child td {
          border-bottom: none;
        }
        
        .cyberpunk-dark tr:nth-child(even) {
          background-color: rgba(31, 41, 55, 0.5);
        }
        
        .cyberpunk-dark tr:hover {
          background-color: rgba(94, 234, 212, 0.05);
        }
        
        .cyberpunk-dark code {
          font-family: 'Courier New', Courier, monospace;
          padding: 0.2em 0.4em;
          background-color: #1f2937;
          color: #5eead4;
          border-radius: 3px;
        }
        
        .cyberpunk-dark pre {
          margin: 1em 0;
          padding: 0;
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }
        
        .cyberpunk-dark pre::before {
          content: "CODE";
          position: absolute;
          top: 0;
          right: 0;
          background-color: #f472b6;
          color: #0f172a;
          padding: 2px 8px;
          font-size: 10px;
          border-bottom-left-radius: 5px;
          z-index: 10;
        }
        
        .cyberpunk-dark img {
          max-width: 100%;
          border-radius: 5px;
          border: 1px solid #5eead4;
        }
        
        /* Light Mode Styles */
        .cyberpunk-light h1, .cyberpunk-light h2, .cyberpunk-light h3,
        .cyberpunk-light h4, .cyberpunk-light h5, .cyberpunk-light h6 {
          color: #7c3aed;
          margin-top: 1.5em;
          margin-bottom: 0.8em;
          font-weight: bold;
          border-bottom: 1px solid #c4b5fd;
          padding-bottom: 0.3em;
        }
        
        .cyberpunk-light h1 { font-size: 1.8em; color: #3b82f6; }
        .cyberpunk-light h2 { font-size: 1.5em; }
        .cyberpunk-light h3 { font-size: 1.3em; }
        
        .cyberpunk-light p {
          margin-bottom: 1em;
          line-height: 1.7;
        }
        
        .cyberpunk-light a {
          color: #3b82f6;
          text-decoration: none;
          border-bottom: 1px dashed #3b82f6;
          transition: all 0.3s ease;
        }
        
        .cyberpunk-light a:hover {
          color: #7c3aed;
          border-bottom-color: #7c3aed;
        }
        
        .cyberpunk-light strong {
          color: #7c3aed;
          font-weight: bold;
        }
        
        .cyberpunk-light em {
          color: #3b82f6;
          font-style: italic;
        }
        
        .cyberpunk-light blockquote {
          border-left: 4px solid #7c3aed;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .cyberpunk-light hr {
          border: 0;
          height: 1px;
          background: linear-gradient(to right, #3b82f6, #7c3aed);
          margin: 2em 0;
        }
        
        .cyberpunk-light ul, .cyberpunk-light ol {
          margin-left: 2em;
          margin-bottom: 1em;
        }
        
        .cyberpunk-light li {
          margin-bottom: 0.5em;
          position: relative;
        }
        
        .cyberpunk-light ul > li::before {
          content: "»";
          color: #3b82f6;
          position: absolute;
          left: -1.5em;
        }
        
        .cyberpunk-light ol {
          counter-reset: item;
        }
        
        .cyberpunk-light ol > li {
          counter-increment: item;
        }
        
        .cyberpunk-light ol > li::before {
          content: counter(item);
          color: #7c3aed;
          position: absolute;
          left: -1.5em;
          font-weight: bold;
        }
        
        .cyberpunk-light table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.1);
        }
        
        .cyberpunk-light th {
          background-color: #f3f4f6;
          color: #7c3aed;
          padding: 0.75em;
          border-bottom: 2px solid #7c3aed;
          text-align: left;
        }
        
        .cyberpunk-light td {
          padding: 0.75em;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .cyberpunk-light tr:last-child td {
          border-bottom: none;
        }
        
        .cyberpunk-light tr:nth-child(even) {
          background-color: rgba(243, 244, 246, 0.5);
        }
        
        .cyberpunk-light tr:hover {
          background-color: rgba(124, 58, 237, 0.05);
        }
        
        .cyberpunk-light code {
          font-family: 'Courier New', Courier, monospace;
          padding: 0.2em 0.4em;
          background-color: #f3f4f6;
          color: #7c3aed;
          border-radius: 3px;
        }
        
        .cyberpunk-light pre {
          margin: 1em 0;
          padding: 0;
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }
        
        .cyberpunk-light pre::before {
          content: "CODE";
          position: absolute;
          top: 0;
          right: 0;
          background-color: #3b82f6;
          color: white;
          padding: 2px 8px;
          font-size: 10px;
          border-bottom-left-radius: 5px;
          z-index: 10;
        }
        
        .cyberpunk-light img {
          max-width: 100%;
          border-radius: 5px;
          border: 1px solid #7c3aed;
        }

        /* アニメーション効果 */
        @keyframes neon-pulse {
          0% { text-shadow: 0 0 4px currentColor; }
          50% { text-shadow: 0 0 8px currentColor; }
          100% { text-shadow: 0 0 4px currentColor; }
        }
        
        .cyberpunk-dark h1, .cyberpunk-dark h2, 
        .cyberpunk-light h1, .cyberpunk-light h2 {
          animation: neon-pulse 2s infinite;
        }
        
        /* コードブロックのスクロールバーカスタマイズ */
        .cyberpunk-dark pre::-webkit-scrollbar,
        .cyberpunk-light pre::-webkit-scrollbar {
          height: 8px;
          background-color: transparent;
        }
        
        .cyberpunk-dark pre::-webkit-scrollbar-thumb {
          background-color: #5eead4;
          border-radius: 4px;
        }
        
        .cyberpunk-light pre::-webkit-scrollbar-thumb {
          background-color: #7c3aed;
          border-radius: 4px;
        }
      `}</style>
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            const isInlineCode = !match;
            
            return isInlineCode ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
              // @ts-ignore または @ts-expect-error を使用して型エラーを無視
              style={isDarkMode ? atomDark : coy}
              language={match && match[1] ? match[1] : ''}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
            );
          },
          // リンクは新しいタブで開く
          a: ({ ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
          // テーブルにレスポンシブラッパーを追加
          table: ({ ...props}) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
          // 画像にローディングレイジー設定
          img: ({ ...props}) => <img loading="lazy" {...props} />
        }}
      >
        {markdown}
      </ReactMarkdown>
      
      {/* コピーライトブロック */}
      <div className={`mt-12 pt-4 border-t ${
        isDarkMode 
          ? 'border-gray-700 text-gray-400' 
          : 'border-gray-200 text-gray-500'
      } text-xs`}>
        <span className={isDarkMode ? 'text-cyan-400' : 'text-purple-600'}>CYBER</span>
        <span className={isDarkMode ? 'text-pink-500' : 'text-blue-600'}>DREAM</span>
        <span> | ドキュメント生成システム v2.4.7</span>
      </div>
    </div>
  );
};

export default MarkdownViewer;