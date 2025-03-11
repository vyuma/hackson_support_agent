# back/routers/framework.py
from fastapi import APIRouter, responses
from pydantic import BaseModel
from services.framework_service import FrameworkService

router = APIRouter()

# Pydantic モデル: 仕様書テキストを受け取る
class Document(BaseModel):
    specification: str

# FrameworkService のインスタンスを生成
framework_service = FrameworkService()

@router.post("/")
def generate_framework_priority(document: Document):
    """
    仕様書のテキストを受け取り、固定のフロントエンドおよびバックエンド候補の
    優先順位と理由を JSON 形式で返すAPI。
    """
    result = framework_service.generate_framework_priority(document.specification)
    return responses.JSONResponse(content=result, media_type="application/json")
