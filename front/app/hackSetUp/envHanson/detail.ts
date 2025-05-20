// app/api/taskDetail/route.ts の修正バージョン

import { DivideTask, TaskResponse } from "@/types/taskTypes";
import { detailRequestType } from "./page";

type TaskDetailGetProps = {
  idea: string;
  duration: string;
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  menber_info: string[];
  task_info: string[];  // オプショナルから必須に変更
  envHanson: string;
};

const fetchTaskDetail = async (tasks: DivideTask[], specification: string) => {
  try {
    // ここでは、送信前にログ出力を追加して内容を確認
    console.log("タスク詳細APIにリクエスト送信:", JSON.stringify({
      "tasks": tasks,
      "specification": specification,
    }));
    
    const taskDetail = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/taskDetail/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "tasks": tasks,
          "specification": specification,
        }),
      }
    ); 
    
    // レスポンスのステータスとテキストをログ出力
    console.log("タスク詳細API レスポンスステータス:", taskDetail.status);
    console.log("タスク詳細API レスポンステキスト:", taskDetail.statusText);
    
    if (!taskDetail.ok) {
      throw new Error("タスク詳細APIエラー: " + taskDetail.statusText);
    }
    // tasksを取得する
    const taskDetailJSON: TaskResponse = await taskDetail.json();
    // tasksを取得する
    const taskDetailData = taskDetailJSON.tasks;

    console.log("タスク詳細APIレスポンス:", taskDetailData);

    // 各タスクに assignment, ID プロパティを追加
    const tasksWithAssignment = taskDetailData.map((task, index: number) => ({
      ...task,
      assignment: task.assignment ?? "",
      task_id: index,
    }));


    // タスク情報を文字列に変換
    const taskInfoStrings = tasksWithAssignment.map((taskObj) => JSON.stringify(taskObj));
    return taskInfoStrings;
  } catch (err: unknown) {
    console.error("TaskDetail API エラー:", err);
    return null;
  }
};

/**
 * DB への POST を行う関数
 * - 成功時は { project_id, message } を受け取り、project_id を返す
 */
const postToDB = async (reqBody: TaskDetailGetProps): Promise<string | null> => {
  try {
    console.log("DBへプロジェクト情報をポストします:", JSON.stringify(reqBody));
    
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/projects",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      }
    );
    
    if (!res.ok) {
      throw new Error("DB POSTエラー: " + res.statusText);
    }
    
    const data = await res.json();
    console.log("DBレスポンス:", data);
    // data = { project_id: "...", message: "..." }
    return data.project_id;
  } catch (error) {
    console.error("DB POST エラー:", error);
    return null;
  }
};


export async function taskDetailGetAndpost(projectData:detailRequestType,tasksData: DivideTask[]) {

  const taskInfo = await fetchTaskDetail(tasksData, projectData.specification);
  if (!taskInfo) {
    throw new Error("タスク情報の取得に失敗しました");
  }
  const taskDetailGetProp: TaskDetailGetProps= {
    idea: projectData.idea,
    duration: projectData.duration,
    num_people: projectData.num_people,
    specification: projectData.specification,
    selected_framework: projectData.selected_framework,
    directory_info: projectData.directory_info,
    menber_info: projectData.menber_info,
    task_info: taskInfo,  // オプショナルから必須に変更
    envHanson: projectData.envHanson,
  }
  // DBにPOST
  const projectId = await postToDB(taskDetailGetProp);
  if (!projectId) {
    throw new Error("プロジェクトIDの取得に失敗しました");
  }
  console.log("プロジェクトID:", projectId);
  return projectId;

}