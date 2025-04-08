from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.schema.runnable import RunnableSequence
from typing import List, Dict
from pydantic import BaseModel
import json
from copy import deepcopy
# json_repair
from json_repair import repair_json

class TaskItem(BaseModel):
    task_name: str
    priority: str  # "Must", "Should", "Could" のいずれか
    content: str

class TaskDetailRequest(BaseModel):
    tasks: List[TaskItem]



from .base_service import BaseService


class TaskDetailService(BaseService):
    def __init__(self):
        super().__init__()
    
    def _format_tasks(self, tasks: List[Dict]) -> str:
        """
        タスクリストをJSON形式の文字列に変換するヘルパーメソッド。
        """
        return json.dumps(tasks, ensure_ascii=False, indent=2)
    
    def _detail_format(self, tasks:TaskDetailRequest)-> List[Dict]:
        """
        タスクリストの形式をpydanticからdictに変換するヘルパーメソッド
        以下のように渡されるTaskDetailResponseクラスをただのdictに変換する
        class TaskItem(BaseModel):
            task_name: str
            priority: str  # "Must", "Should", "Could" のいずれか
            content: str
        class TaskDetailRequest(BaseModel):
            tasks: List[TaskItem]
        """
        # TaskDetailRequestを辞書に変換
        task_dict = tasks 
        
        print(type(task_dict)) # list
        return task_dict
        
        
    
    def generate_task_details_by_batch(self, tasks: List[Dict]) -> List[Dict]:
        batch = 5
        results = []
        for i in range(0, len(tasks), batch):
            print(f'これは回数{i}回目です')
            batch_tasks = tasks[i:i + batch]
            # タスクリストをJSON形式の文字列に変換
            tasks_input = self._detail_format(batch_tasks)
            # タスク詳細を生成
            task_details = self.generate_task_details(tasks_input)
            results.extend(task_details)
        return results
    
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
        
        # 中間出力を保存する辞書
        intermediate_results = {}
        # 中間出力をキャプチャする関数 完全な副作用関数なので基本的にこのスコープの中で閉じ込めておくべき
        
        def capture_output(x):
            intermediate_results["llm_output"] = x
            # ここでJSONを修正する
            # JSONの修正
            # AIMessageからコンテンツを取得
            print(intermediate_results)
            
            if hasattr(x, 'content'):
                content = x.content
            else:
                # AIMessageでない場合は文字列変換を試みる
                content = str(x)
            # JSONを修正
            repaired_json = repair_json(content)
            if hasattr(x, 'content'):
            # AIMessageの場合は、contentを置き換えた新しいオブジェクトを作成
                repaired_message = deepcopy(x)
                repaired_message.content = repaired_json
                return repaired_message
            else:
                # それ以外の場合は修復された文字列を返す
                return repaired_json
        
        # LLMから出てくる生文字列を出力したい
        chain =(
            prompt_template
            | self.llm_pro
            | (lambda x: capture_output(x)) # 中間出力のキャプチャ
            | parser
        )
        result = chain.invoke({"tasks_input": tasks})
        
        return result.get("tasks", [])

if __name__ == '__main__':
    tasks = [
        {"task_name": "要件定義", "priority": "Must", "content": "要件定義を行う"},
        {"task_name": "設計", "priority": "Should", "content": "設計を行う"},
        {"task_name": "実装", "priority": "Could", "content": "実装を行う"},
        {"task_name": "テスト", "priority": "Must", "content": "テストを行う"},
        {"task_name": "デプロイ", "priority": "Should", "content": "デプロイを行う"},
        {"task_name": "運用", "priority": "Could", "content": "運用を行う"},
    ]

    service = TaskDetailService()
    print("Original Tasks:")
    task_details = service.generate_task_details_by_batch(tasks)
    print("Generated Task Details:")
    print(json.dumps(task_details, ensure_ascii=False, indent=2))