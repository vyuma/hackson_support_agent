import { AlertTriangle } from 'lucide-react';
import Loading from '@/components/Loading';


export default function LoadingPage() {
    const darkMode = true; // ここでダークモードの状態を管理する
    return (
        <>
            <div className={`min-h-screen font-mono transition-all duration-500 flex items-center justify-center ${
                    darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {/* Glowing edges */}
                    <div className="fixed bottom-0 left-0 right-0 h-1 z-1000">
                        <div className={`h-full ${darkMode ? 'bg-cyan-500' : 'bg-purple-500'} animate-pulse`}></div>
                    </div>
                    <div className="fixed top-0 bottom-0 right-0 w-1 z-20">
                        <div className={`w-full ${darkMode ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
                    </div>
                    {/* サイバーパンク風ローディングアニメーション */}
                    <Loading darkMode={darkMode} />
            </div>
        </>
    )
}