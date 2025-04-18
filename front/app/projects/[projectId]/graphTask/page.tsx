"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// react-d3-tree は SSR 対応が難しいため、dynamic import を利用
const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

// 型定義
interface GraphEdge {
  parent: number;
  child: number;
}

interface Task {
  task_id: number;
  task_name: string;
  content: string;
  children?: Task[];
}

interface ProjectData {
  task_info: string[];
}

// ダイアグラム用のノード型
interface TreeNode {
  name: string;
  attributes?: { [key: string]: string };
  children?: TreeNode[];
}

const GraphTaskPage: React.FC = () => {
  const { projectId } = useParams(); // URLから projectId を取得
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[] | null>(null);
  const [diagramData, setDiagramData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // プロジェクト情報取得
  const fetchProject = async () => {
    try {
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
        setLoading(false);
        return;
      }
      const data: ProjectData = await res.json();
      setProjectData(data);
    } catch (err) {
      console.error("プロジェクト情報取得エラー:", err);
      setError("プロジェクト情報の取得に失敗しました");
      setLoading(false);
    }
  };

  // タスクグラフ(API)呼び出し
  const fetchTaskGraph = async (taskInfo: string[]) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/graphTask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // DB保存形式の task_info（JSON文字列の配列）をそのまま渡す
          body: JSON.stringify({ task_info: taskInfo }),
        }
      );
      if (!res.ok) {
        throw new Error(`エラーコード: ${res.status}`);
      }
      const data = await res.json();
      setGraphEdges(data.edges);
    } catch (err) {
      console.error("タスクグラフ取得エラー:", err);
      setError("タスクグラフの取得に失敗しました");
    }
  };

  // プロジェクト情報取得初回ロード
  useEffect(() => {
    const loadProject = async () => {
      await fetchProject();
    };
    loadProject();
  }, [projectId, fetchProject]);

  // プロジェクト情報取得後、task_infoがあればタスクグラフ取得
  useEffect(() => {
    if (projectData && projectData.task_info && projectData.task_info.length > 0) {
      fetchTaskGraph(projectData.task_info);
    } else if (projectData) {
      setGraphEdges([]);
      setLoading(false);
    }
  }, [projectData]);

  // task_info 配列の各要素をパースして Task 配列に変換
  const parseTasks = (taskInfo: string[]): Task[] => {
    return taskInfo
      .map((taskStr) => {
        try {
          const taskObj = JSON.parse(taskStr);
          return {
            task_id: taskObj.task_id,
            task_name: taskObj.task_name,
            content: taskObj.content,
          } as Task;
        } catch (e) {
          console.error("task_infoパースエラー:", e);
          return null;
        }
      })
      .filter((t): t is Task => t !== null);
  };

  // Task 配列と依存エッジ情報から木構造を生成
  const buildTaskTree = (tasks: Task[], edges: GraphEdge[]): Task[] => {
    const taskMap: { [key: number]: Task } = {};
    tasks.forEach((task) => {
      taskMap[task.task_id] = { ...task, children: [] };
    });
    const childIdSet = new Set<number>();
    edges.forEach((edge) => {
      const parent = taskMap[edge.parent];
      const child = taskMap[edge.child];
      if (parent && child) {
        parent.children?.push(child);
        childIdSet.add(child.task_id);
      }
    });
    const roots = tasks.filter((task) => !childIdSet.has(task.task_id));
    return roots.map((root) => taskMap[root.task_id]);
  };

  // Task 木構造から react-d3-tree 用のデータに変換する
  const transformToTreeNode = (nodes: Task[]): TreeNode[] => {
    return nodes.map((node) => ({
      name: node.task_name,
      attributes: {
        "ID": String(node.task_id),
        "内容": node.content,
      },
      children: node.children && node.children.length > 0 ? transformToTreeNode(node.children) : undefined,
    }));
  };

  // プロジェクト情報とエッジ情報が取得済みの場合、Task 木と diagramData を生成
  useEffect(() => {
    if (projectData && graphEdges !== null) {
      const tasks = parseTasks(projectData.task_info);
      const tree = buildTaskTree(tasks, graphEdges);
      // diagramData はルートが1つの場合はそのまま、それ以外ならダミールートでまとめる
      const nodes = transformToTreeNode(tree);
      const diagram: TreeNode =
        nodes.length === 1 ? nodes[0] : { name: "ROOT", children: nodes };
      setDiagramData(diagram);
      setLoading(false);
    }
  }, [projectData, graphEdges, transformToTreeNode]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h2>開発フロー（タスク木構造）</h2>
      {loading && <p>読み込み中…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {diagramData && (
        <div id="treeWrapper" style={{ width: "100%", height: "80vh" }} ref={treeContainerRef}>
          <Tree 
            data={diagramData}
            orientation="horizontal"  // または "horizontal" で好みの方向に調整可
            pathFunc="step"         // エッジ描画方法
            translate={{ x: 200, y: 50 }} // 初期の描画位置調整
          />
        </div>
      )}
    </div>
  );
};

export default GraphTaskPage;
