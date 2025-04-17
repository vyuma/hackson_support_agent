"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import GanttChart from "./GanttChart";
import { 
  ProjectData, 
  DurationData, 
  Task, 
  fetchProject, 
  fetchTaskGraph, 
  mapDurationsToTasks 
} from "./GanttChartUtils";

const GanttChartClient: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [durations, setDurations] = useState<DurationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    const loadData = async () => {
      try {
        // プロジェクトデータ取得
        const proj = await fetchProject(projectId);
        setProjectData(proj);
        
        // タスク期間取得API呼び出し
        const durationsData = await fetchTaskGraph(proj.duration, proj.task_info);
        setDurations(durationsData);
      } catch (err: any) {
        setError("データの取得に失敗しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);

  // タスククリック時の処理
  const handleTaskClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <div className="font-bold">エラー</div>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!projectData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <div className="font-bold">エラー</div>
        <p>プロジェクト情報がありません</p>
      </div>
    );
  }

  // タスクデータに変換
  const tasks = mapDurationsToTasks(durations);

  return (
    <div className="p-5">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">{projectData.idea}</h2>
        
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">プロジェクト期間: {projectData.duration}</div>
          <div className="text-sm text-gray-500">
            タスク数: {tasks.length}件
          </div>
        </div>
        
        {tasks.length > 0 ? (
          <GanttChart 
            tasks={tasks} 
            onTaskClick={handleTaskClick} 
          />
        ) : (
          <div className="text-center py-10 text-gray-500">
            タスクが設定されていません
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChartClient; 