/** ドラッグアイテムの型 (react-dnd用) */
export interface DragItem {
    type: string;    // 例: "TASK"
    index: number;   // タスクの一意index
  }
  
  /** useDragで使うCollectedProps */
  export interface DragCollectedProps {
    isDragging: boolean;
  }
  
  /** useDropで使うCollectedProps */
  export interface DropCollectedProps {
    isOver: boolean;
  }
  