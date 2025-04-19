// app/api/taskDetail/route.ts の修正バージョン

import { DivideTask, TaskResponse } from "@/types/taskTypes";

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

export async function TaskDetailFetchAndPost(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // リクエストボディの内容をログ出力して確認
    console.log("受信したリクエストボディ:", JSON.stringify(body, null, 2));
    
    // リクエストがDBスキーマに直接一致する場合とtasksDataを含む場合の両方に対応
    let projectData: TaskDetailGetProps;
    let tasksData: DivideTask[] | null = null;
    
    // リクエスト形式の判別
    if (body.tasksData) {
      // 従来の形式: {reqBodyData, tasksData}
      const { reqBodyData, tasksData: tasks } = body;
      if (!reqBodyData || !tasks || !Array.isArray(tasks)) {
        return Response.json(
          { message: "無効なリクエスト形式です" },
          { status: 400 }
        );
      }
      
      projectData = reqBodyData as TaskDetailGetProps;
      tasksData = tasks;
    } else {
      // 新しい形式: 直接DBスキーマに合わせたフォーマット
      // 必須フィールドの存在チェック
      const requiredFields = [
        'idea', 'duration', 'num_people', 'specification', 
        'selected_framework', 'directory_info', 'menber_info', 
        'task_info', 'envHanson'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in body));
      if (missingFields.length > 0) {
        return Response.json(
          { message: `必須フィールドが不足しています: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      
      projectData = body as TaskDetailGetProps;
    }
    
    // タスクデータがある場合は処理して追加
    if (tasksData) {
      const taskInfo = await fetchTaskDetail(tasksData, projectData.specification);
      if (!taskInfo) {
        throw new Error("タスク情報の取得に失敗しました");
      }
      projectData.task_info = taskInfo;
    }
    
    // DBにPOST
    const projectId = await postToDB(projectData);
    if (!projectId) {
      throw new Error("プロジェクトIDの取得に失敗しました");
    }
    
    console.log("プロジェクトID:", projectId);
    return Response.json({
      project_id: projectId,
      message: "プロジェクト情報が正常に保存されました",
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("エラー:", error);
    // エラーメッセージをログ出力
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      return Response.json(
        { message: "プロジェクト情報の保存に失敗しました: " + (error.message || "不明なエラー") },
        { status: 500 }
      );
    } else {
      return Response.json(
        { message: "プロジェクト情報の保存に失敗しました: 不明なエラー" },
        { status: 500 }
      );
    }
  }
}