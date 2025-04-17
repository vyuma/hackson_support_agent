// プロジェクト取得APIの返り値の型定義
export type ProjectData = {
  project_id: string;           // プロジェクトID (UUID)
  idea: string;                 // プロジェクト名または概要
  duration: string;             // 例："２週間"（入力はstring）
  num_people: number;
  specification: string;
  selected_framework: string;
  directory_info: string;
  menber_info: string[];
  task_info: string[];          // DB保存形式のタスク情報（JSON文字列の配列）
  envHanson: string;
};

// タスク期間取得APIの返り値の型定義
export type DurationData = {
  task_id: number;
  start: number;  // 何日目か（整数）
  end: number;    // 何日目か（整数）
};

// カスタムタスク型定義
export type Task = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
};

// 基準日を定義（ここでは例として固定：2025-01-01）
export const BASELINE_DATE = new Date("2025-01-01");

/**
 * 整数の日付（基準日からの何日目）を Date 型に変換する
 */
export const getDateFromDay = (day: number): Date => {
  const date = new Date(BASELINE_DATE);
  date.setDate(date.getDate() + day - 1);
  return date;
};

/**
 * タスク期間データをタスク型に変換する
 */
export const mapDurationsToTasks = (durations: DurationData[]): Task[] => {
  return durations.map((d) => ({
    id: String(d.task_id),
    name: `タスク ${d.task_id}`,
    start: getDateFromDay(d.start),
    end: getDateFromDay(d.end),
    progress: 0,
    dependencies: []
  }));
};

/**
 * 日付から日数（基準日からの日数）を計算する
 */
export const getDayFromDate = (date: Date): number => {
  return Math.ceil((date.getTime() - BASELINE_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * プロジェクト情報取得API呼び出し
 */
export const fetchProject = async (projectId: string): Promise<ProjectData> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      throw new Error(`プロジェクト情報取得失敗: ${res.statusText}`);
    }
    const data: ProjectData = await res.json();
    return data;
  } catch (err) {
    console.error("プロジェクト情報取得エラー:", err);
    throw err;
  }
};

/**
 * タスク期間取得API呼び出し
 */
export const fetchTaskGraph = async (duration: string, taskInfo: string[]): Promise<DurationData[]> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/durationTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: duration, task_info: taskInfo }),
    });
    if (!res.ok) {
      throw new Error(`タスク期間取得失敗: ${res.statusText}`);
    }
    const data = await res.json();
    return data.durations;
  } catch (err) {
    console.error("タスク期間取得エラー:", err);
    throw err;
  }
}; 