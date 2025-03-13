from fastapi import APIRouter, responses
from pydantic import BaseModel
from typing import List
from services.taskDetail_service import TaskDetailService

router = APIRouter()

class TaskItem(BaseModel):
    task_name: str
    priority: str  # "Must", "Should", "Could" のいずれか
    content: str

class TaskDetailRequest(BaseModel):
    tasks: List[TaskItem]

@router.post("/")
def generate_task_details(request: TaskDetailRequest):
    """
    入力のタスクリストに対して、各タスクに「detail」項目を追加した結果を返すAPI。
    出力例:
    {
      "tasks": [
        {
          "task_name": "要件定義",
          "priority": "Must",
          "content": "…",
          "detail": "さらに具体的なハンズオンの手順"
        },
        ...
      ]
    }
    """
    detailed_tasks = TaskDetailService().generate_task_details(request.tasks)
    return responses.JSONResponse(content={"tasks": detailed_tasks}, media_type="application/json")
