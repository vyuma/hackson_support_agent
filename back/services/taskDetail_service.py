from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService
from typing import List, Dict
import json

class TaskDetailService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_task_details(self, tasks: List[Dict]) -> List[Dict]:
        """
        入力のタスクリスト（各タスクは task_name, priority, content を含む）を受け取り、
        各タスクに具体的なハンズオンの手順を「detail」として追加したタスクリストを返す。
        """
        response_schemas = [
            ResponseSchema(
                name="tasks",
                description=(
                    "各タスクは以下の形式のオブジェクトです。"
                    "タスク名、優先度（Must, Should, Could）、内容、そして追加の詳細情報（detail）を含む。"
                ),
                type="array(objects)"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
                        あなたはタスク詳細化のエキスパートです。以下のタスクリストについて、各タスクに対して具体的なハンズオンの手順を「detail」として生成してください。
                        具体的なハンズオンは、詳細な手順やコマンド、コードの記述などを含めてください。
                        また、マークダウン形式でこれを見るだけでこのタスクを完了できるほどの詳細さで出力してください。
                        ただし、コードに関しては最小限の記述で十分です。ある程度は読者の自力で考えられるようにしてください。
                        ユーザーはハッカソンに参加する初心者です。
                        入力タスクリスト:
                        {tasks_input}
                        回答は以下のJSON形式で出力してください:
                        {format_instructions}
                    """,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        # JSON形式の文字列に変換
        tasks_input = json.dumps([task.dict() for task in tasks], ensure_ascii=False, indent=2)
        
        chain = prompt_template | self.flash_llm_pro | parser
        result = chain.invoke({"tasks_input": tasks_input})
        # result は {"tasks": [...] } となることを期待
        return result.get("tasks", [])
