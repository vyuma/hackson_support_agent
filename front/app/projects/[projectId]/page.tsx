"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ParticipantColumn from "../../components/ParticipantColumn";

interface Task {
  taskName: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  assignee: string;
}

interface Project {
  project_id: string;
  idea: string;
  num_people: number;
  tasks: Task[];
}

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + `/projects/${projectId}`
        );
        if (!res.ok) throw new Error("プロジェクト取得エラー");
        const data = await res.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクトが見つかりません</p>;

  // 担当者ごとにタスクをグループ化（ここでは単純に assignee でグループ化）
  const participants = Array.from(new Set(project.tasks.map(task => task.assignee)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">プロジェクト作業（カンバン形式）</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <ParticipantColumn 
            key={participant} 
            participant={participant} 
            tasks={project.tasks.filter(task => task.assignee === participant)}
          />
        ))}
      </div>
    </div>
  );
}
