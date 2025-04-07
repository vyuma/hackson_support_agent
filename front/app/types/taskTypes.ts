/** タスク情報 (サーバーやフロントで扱う共通) */

export interface DivideTask {
  task_name: string;
  priority: "Must" | "Should" | "Could";
  content: string;
  // detail は UI には表示せず、API呼び出し結果としてセッションストレージに保存するだけ
  detail?: string;
}

export interface TaskDetail {
  tasks: Task[];
}

export interface DirectoryResponse {
  directory_structure: string;
}

export interface TaskResponse {
  tasks: Task[];
}
export interface Task {
    task_id: string;
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
    menber_info: never[];
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
  export interface EnvHandsOn {
    overall: string;
    devcontainer: string;
    frontend: string;
    backend: string;
  }
  
  export type requestBodyType = {
    idea: string;
    duration: string;
    num_people: number;
    specification: string;
    selected_framework: string;
    directory_info: string;
    menber_info: string[];
    task_info: string[];
    envHanson: string;
    };
  