"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Task, ProjectData } from "../../types/taskTypes";
import Column from "../../components/Column";

const UNASSIGNED = "";
const DONE = "done";

export default function ProjectBoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ★ menber_info をローカルステート管理 (["A","B","C"]など)
  const [members, setMembers] = useState<string[]>([]);

  /** プロジェクト情報の取得 */
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("プロジェクトIDが指定されていません");
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`);
        if (!res.ok) throw new Error("プロジェクト取得エラー");
        const data: ProjectData = await res.json();

        // task_info => string[] => 各要素を {task_name, ...} としてパース
        const allTasks: Task[] = [];
        data.task_info.forEach((taskStr, idx) => {
          try {
            const parsed = JSON.parse(taskStr);
            allTasks.push({ ...parsed, __index: idx });
          } catch (parseErr) {
            console.error("タスク情報パース失敗:", parseErr);
          }
        });

        setProject(data);
        setTasks(allTasks);
        // ★ menber_info（スペルはサーバー仕様に合わせて）
        // ここで data.menber_info が存在するなら、それをステートにセット
        setMembers(data.menber_info ?? []);
      } catch (err: any) {
        setError(err.message || "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  /** カードのドロップ時に assignment を更新してPUT */
  const handleDropTask = useCallback(
    async (dragIndex: number, newAssignment: string) => {
      if (!project) return;
      const updatedTasks = tasks.map((t) =>
        t.__index === dragIndex ? { ...t, assignment: newAssignment } : t
      );
      setTasks(updatedTasks);

      // 更新用の task_info
      const updatedTaskInfo = updatedTasks.map((t) =>
        JSON.stringify({
          task_name: t.task_name,
          priority: t.priority,
          content: t.content,
          detail: t.detail,
          assignment: t.assignment,
        })
      );

      // PUT送信用ボディ
      const reqBody = {
        ...project,
        task_info: updatedTaskInfo,
        menber_info: members, // ☆ メンバーも同じまま送る
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.project_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
          }
        );
        if (!res.ok) {
          console.error("プロジェクト更新失敗:", res.statusText);
        }
      } catch (updErr) {
        console.error("プロジェクト更新エラー:", updErr);
      }
    },
    [tasks, project, members]
  );

  /** 参加者名の変更イベント */
  const handleMemberNameChange = (colIndex: number, newName: string) => {
    const newArr = [...members];
    newArr[colIndex] = newName;
    setMembers(newArr);
  };

  /** 参加者名を保存 (PUT) する */
  const handleSaveMembers = async () => {
    if (!project) return;

    const updatedTaskInfo = tasks.map((t) =>
      JSON.stringify({
        task_name: t.task_name,
        priority: t.priority,
        content: t.content,
        detail: t.detail,
        assignment: t.assignment,
      })
    );

    const reqBody = {
      ...project,
      menber_info: members,
      task_info: updatedTaskInfo,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.project_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        }
      );
      if (!res.ok) {
        console.error("参加者名更新失敗:", res.statusText);
      } else {
        console.log("参加者名更新成功");
      }
    } catch (err) {
      console.error("参加者名更新エラー:", err);
    }
  };

  // タスク詳細ページへ
  const handleTaskClick = (index: number) => {
    // 例: /projects/{projectId}/task/{index} に飛ばす
    router.push(`/projects/${projectId}/task/${index}`);
  };

  if (loading) return <p>ロード中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>プロジェクト情報がありません。</p>;

  // カラム用
  const unassignedTasks = tasks.filter((t) => t.assignment === UNASSIGNED);
  const doneTasks = tasks.filter((t) => t.assignment === DONE);

  return (
    <DndProvider backend={HTML5Backend}>
      <header className="p-4 bg-gray-800 text-white mb-4">
        <h1 className="text-2xl font-bold">プロジェクト: {project.idea}</h1>
        <p>ID: {project.project_id} / 人数: {project.num_people}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* 未定Column */}
        <Column
          assignmentKey={UNASSIGNED}
          columnTitle="未定"
          tasks={unassignedTasks}
          onDropTask={handleDropTask}
          isMemberColumn={false}
        />

        {/* メンバーColumn (各列) */}
        {members.map((memberName, colIndex) => {
          const assignedTasks = tasks.filter((t) => t.assignment === memberName);
          return (
            <Column
              key={colIndex}
              assignmentKey={memberName}
              columnTitle={memberName}
              tasks={assignedTasks}
              onDropTask={handleDropTask}
              isMemberColumn={true}
              onMemberNameChange={(newName: string) =>
                handleMemberNameChange(colIndex, newName)
              }
            />
          );
        })}

        {/* 完了Column */}
        <Column
          assignmentKey={DONE}
          columnTitle="完了"
          tasks={doneTasks}
          onDropTask={handleDropTask}
          isMemberColumn={false}
        />
      </div>

      {/* 参加者名をまとめて保存するボタン */}
      <div className="p-4">
        <button
          onClick={handleSaveMembers}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          参加者名の変更を保存
        </button>
      </div>
    </DndProvider>
  );
}
