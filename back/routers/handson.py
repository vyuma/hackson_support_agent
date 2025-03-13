# back/routers/framework.py
from fastapi import APIRouter, responses
from pydantic import BaseModel
from services.handson_service import HandsOnService

router = APIRouter()



class DetailTask(BaseModel):
    specification: str
    task_tile: str
    priority: int
    task_specification: str


# HandsOnService のインスタンスを生成
framework_service = HandsOnService()

@router.post("/")
def generate_handson(specificationTask: DetailTask):
    """
    仕様書のテキストを受け取り、ハンズオンを生成するAPI。
    """
    specification = specificationTask.specification
    task_tile = specificationTask.task_tile
    priority = specificationTask.priority
    task_specification = specificationTask.task_specification
    result = framework_service.generate_handson(specification,task_tile,priority,task_specification)
    return responses.JSONResponse(content=result, media_type="application/json")



