/** タスク情報 (サーバーやフロントで扱う共通) */
export interface Task {
    task_name: string;
    priority: "Must" | "Should" | "Could";
    content: string;
    assignment: string; // "", "done" or participant name
    detail?: string;
    // DnD で扱う際に一意キーとして使うための補助
    __index?: number;
  }
  
  /** サーバーから取得するプロジェクトデータ */
  export interface ProjectData {
    project_id: string;
    idea: string;
    duration: string;
    num_people: number;
    specification: string;
    selected_framework: string;
    directory_info: string;
    task_info: string[]; 
    //   ↑ "string"配列で、要素の中に {"tasks": [...Task]} が入るJSON文字列が渡される
  }
  