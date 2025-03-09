from fastapi import APIRouter, responses
from pydantic import BaseModel
from services.tasks_service import TasksService

router = APIRouter()
tasks_service = TasksService()

class YumeSummary(BaseModel):
    Summary: str


@router.post("/")
def generate_yume_object_and_tasks(yume_summary: YumeSummary):
    """
    旧: /api/get_object_and_tasks
    yume_summary.Summary を受け取り、オブジェクト＆タスク一覧を生成。
    """
    object_and_tasks = tasks_service.generate_yume_object_and_task(
        yume_summary.Summary
    )
    # JSON形式
    return responses.JSONResponse(content=object_and_tasks, media_type="application/json")
