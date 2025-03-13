# back/services/handson_service.py
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from .base_service import BaseService

# タスク分割しました。タスク分割されても何やれば良いのか？


# ハンズオンは元々のタスクがリスト　
# 仕様書の内容とタスクのタイトルと優先度に基づいて機能をつけるためのハンズオンを生成する AI サービス

class HandsOnService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_handson(self, specification: str,task_tile:str,priority:int,task_specification:str):
        """
        仕様書の内容とタスクのタイトルと優先度に基づいて機能をつけるためのハンズオンを生成する。
        入力：
            specification: 仕様書の内容
            task_tile: タスクのタイトル
            priority: 優先度
            task_specification: タスクの仕様
        出力：
            handson: ハンズオン
        """
        
        prompt =ChatPromptTemplate.from_template(
            template="""
            あなたはプロダクト開発のエキスパートです。
            あなたは、以下の仕様書の内容とタスクのタイトルと優先度に基づいて機能をつけるためのハンズオンを生成する AI サービスです.
            仕様書:
            {specification}
            タイトル:
            {task_tile}
            優先度:
            {priority}
            タスクの詳細:
            {task_specification}
            上記をもとにハンズオンを出力してください。
            """,
            partial_variables={"task_tile":task_tile,"priority":priority,"task_specification":task_specification}
        )
        parser = StrOutputParser()
        chain = prompt | self.flash_llm_pro | parser
        handson = chain.invoke({"specification": specification})
        return handson
        
if __name__ == '__main__':
    service = HandsOnService()
    specification = """
    仕様書の内容
    RAGサービスを作るための仕様書
    RAGサービスにより検索システムを構築する
    
    """
    task_tile = "RAGの実装"
    priority = 1
    task_specification = "テキストデータのリストからRAGを実装する"
    handson = service.generate_handson(specification,task_tile,priority,task_specification)
    print(handson)
    print(type(handson))
