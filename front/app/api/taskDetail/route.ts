

// app/api/taskDetail/route.ts の修正バージョン

import { TaskResponse, Task, DivideTask } from "@/types/taskTypes";

type TaskDetailGetProps = {
  idea: string;
  duration: string;
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  menber_info: string[];
  task_info?: string[];
  envHanson: string;
};

const fetchTaskDetail = async (tasks: DivideTask[]) => {
  try {
    // ここでは、送信前にログ出力を追加して内容を確認
    console.log("タスク詳細APIにリクエスト送信:", JSON.stringify(tasks));
    
    const taskDetail = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/taskDetail/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tasks),
      }
    ); 
    
    // レスポンスのステータスとテキストをログ出力
    console.log("タスク詳細API レスポンスステータス:", taskDetail.status);
    console.log("タスク詳細API レスポンステキスト:", taskDetail.statusText);
    
    if (!taskDetail.ok) {
      throw new Error("タスク詳細APIエラー: " + taskDetail.statusText);
    }
    
    const taskDetailData: Task[] = await taskDetail.json();
    console.log("タスク詳細APIレスポンス:", taskDetailData);

    // 各タスクに assignment, ID プロパティを追加
    const tasksWithAssignment = taskDetailData.map((task, index: number) => ({
      ...task,
      assignment: task.assignment ?? "",
      task_id: index,
    }));

    // DB に送る際、task_info は string[] を想定 ⇒ 各タスクを JSON.stringify して入れるなど方法は任意
    // ここでは各 detailTask オブジェクトをまとめて string 化
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

// 正しいRoute Handler
export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { reqBodyData, tasksData } = body;
    
    // リクエストボディの内容をログ出力して確認
    console.log("受信したリクエストボディ:", JSON.stringify(body, null, 2));
    
    // reqBodyDataとtasksDataの型チェック (実際の環境に合わせて調整)
    if (!reqBodyData || !tasksData || !Array.isArray(tasksData)) {
      return Response.json(
        { message: "無効なリクエスト形式です" },
        { status: 400 }
      );
    }
    
    const reqBody = reqBodyData as TaskDetailGetProps;
    const tasks = tasksData as DivideTask[];
    
    // タスク詳細を取得
    const taskInfo = await fetchTaskDetail(tasks);
    if (!taskInfo) {
      throw new Error("タスク情報の取得に失敗しました");
    }
    
    // reqBodyにtask_infoを追加
    reqBody.task_info = taskInfo;
    
    // DBにPOST
    const projectId = await postToDB(reqBody);
    if (!projectId) {
      throw new Error("プロジェクトIDの取得に失敗しました");
    }
    
    console.log("プロジェクトID:", projectId);
    return Response.json({
      project_id: projectId,  // EnvHandsOnPage.jsで期待しているプロパティ名に合わせる
      message: "プロジェクト情報が正常に保存されました",
    }, { status: 200 });
  } catch (error: any) {
    console.error("エラー:", error);
    return Response.json(
      { message: "プロジェクト情報の保存に失敗しました: " + (error.message || "不明なエラー") },
      { status: 500 }
    );
  }
}