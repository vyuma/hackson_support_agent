import { AlertTriangle } from 'lucide-react';
import Loading from '@/components/Loading';


export default function LoadingPage() {

    return (
        <>
            <Loading darkMode={true} />
            <AlertTriangle/>
        </>
    )
}