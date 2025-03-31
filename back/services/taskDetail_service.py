from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService
from typing import List, Dict
import json
import re

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
                    "例: {task_name: string, priority: string, content: string, detail: string}"
                ),
                type="array(objects)"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
                        あなたはタスク詳細化のエキスパートです。以下のタスクリストについて、各タスクに対して具体的なハンズオンの手順を「detail」として生成してください。
                        detailは、タスクの内容をさらに具体化したもので、この形式を必ず守ってください。
                        具体的なハンズオンは、詳細な手順やコマンド、コードの記述などを含めてください。
                        また、マークダウン形式でこれを見るだけでこのタスクを完了できるほどの詳細さで出力してください。
                        ただし、コードに関しては最小限の記述で十分です。ある程度は読者の自力で考えられるようにしてください。
                        ユーザーはハッカソンに参加する初心者です。
                        重要: 応答は必ず有効なJSONである必要があります。特殊文字（バックスラッシュ、引用符など）は適切にエスケープしてください。Markdownのコードブロック内でも引用符とバックスラッシュには特に注意が必要です。
                        以下の制約を厳密に守ってください:
                        1. 出力は単純な構造を持つ必要があります: "tasks"キーの配列のみです
                        2. 各タスクには task_name, priority, content, detail フィールドのみを含めてください
                        3. 改行は文字列内で "\\n" としてエスケープしてください
                        4. コードブロックを含める場合は、Markdown記法の ```の代わりに "```" とエスケープしてください
                        5. JSON文字列として有効であることを優先し、必要に応じて内容を簡略化してください
                        入力タスクリスト:
                        {tasks_input}
                        回答は以下のJSON形式で出力してください:
                        {format_instructions}
                        最後に、JSONが有効であることを確認してから返答してください。
                        
                    """,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        # JSON形式の文字列に変換
        tasks_input = json.dumps([task.dict() for task in tasks],  indent=2)
        
        chain = prompt_template | self.llm_pro | parser
        result = chain.invoke({"tasks_input": tasks_input})
        # result は {"tasks": [...] } となることを期待
        return result.get("tasks", [])


if __name__ == '__main__':
    tasks = [
        {"task_name": "要件定義", "priority": "Must", "content": "要件定義を行う"},
        {"task_name": "画面設計", "priority": "Must", "content": "画面設計を行う"},
        {"task_name": "実装", "priority": "Must", "content": "実装を行う"},
    ]

    service = TaskDetailService()
    
    try:
        task_details = service.generate_task_details(tasks)
        print("Generated Task Details:")
        print(json.dumps(task_details, ensure_ascii=False, indent=2))
    except Exception as e:
        print("Test failed with error:", str(e))