from fastapi import APIRouter, responses
from pydantic import BaseModel
from services.qanda_service import QandaService

router = APIRouter()

# Pydantic Models
class YumePrompt(BaseModel):
    Prompt: str

# Service Instance
qanda_service = QandaService()


@router.post("/")
def generate_yume_question(yume_prompt: YumePrompt):
    """
    yume_prompt.Prompt を受け取り、Q&Aを返す。
    """
    yume_question = qanda_service.generate_yume_question(yume_prompt.Prompt)
    # JSON形式
    return responses.JSONResponse(content=yume_question, media_type="application/json")
