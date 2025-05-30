from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class TasksService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_tasks(self, specification: str, directory: str, framework: str):
        """
        仕様書、ディレクトリ構成、フレームワーク情報に基づいて、
        アプリ制作に必要なタスクをリスト形式で生成する。
        各タスクはタスク名、優先度（Must, Should, Could）、具体的な内容を含む。
        """
        response_schemas = [
            ResponseSchema(
                name="tasks",
                description=(
                    "{tasks:[ {task_name: string , priority: 'Must' or 'Should' or 'Could' , content: string } ] }"
                ),
                type="array(objects)"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)
        prompt_template = ChatPromptTemplate.from_template(
            template="""
                        あなたはアプリ制作のプロフェッショナルです。以下の情報に基づいて、アプリ制作に必要な全タスクを具体的にリストアップしてください。
                        ただし、環境構築に関するタスクは含めないでください。
                        仕様書:
                        {specification}
                        ディレクトリ構成:
                        {directory}
                        フレームワーク:
                        {framework}
                        各タスクには、タスク名、優先度（Must, Should, Could）、具体的な内容を含めてください。
                        具体的に言うと、task_name: str 、priority: str ("Must", "Should", "Could") のいずれか 、content: strの全てを必ず含むものです。
                        回答は以下のフォーマットに従い、JSON形式で出力してください。
                        {format_instructions}
                    """,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        try:
            # LLM呼び出し
            llm_response = prompt_template | self.llm_pro
            raw = getattr(llm_response, "content", str(llm_response.invoke({
                "specification": specification, 
                "directory": directory, 
                "framework": framework
            })))
            return raw.get("tasks", [])
        except Exception as e:
            logger.error("タスク生成失敗: %s", e, exc_info=True)
            # 失敗時は基本的なフォールバックタスクを返す
            return [
                {
                    "task_name": "タスク生成エラー", 
                    "priority": "Must", 
                    "content": f"タスク生成中にエラーが発生しました: {e}"
                }
            ]
            

