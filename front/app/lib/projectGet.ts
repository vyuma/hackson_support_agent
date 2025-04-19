// projectをgetなどをするためのAPIを呼び出す関数
import { requestBodyType } from "@/types/taskTypes";

export const getProjectPeops = async (projectId: string) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    )
    if (!res.ok) {
        throw new Error("プロジェクト取得APIエラー: " + res.statusText);
    }
    const data:requestBodyType = await res.json();

    return data;
}