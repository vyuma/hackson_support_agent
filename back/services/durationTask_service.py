from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)

class DurationTaskService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_task_durations(self, duration: str, tasks: List[Dict]) -> List[Dict]:
        """
        入力のプロジェクト全期間 (duration: 日数) と各タスク（task_id, task_name, content を含む）
        をもとに、各タスクの作業期間（開始日、終了日）を算出し、ガントチャート作成用の情報を返します。
        
        出力例（JSON形式）:
        {
          "durations": [
            {"task_id": 0, "start": 1, "end": 5},
            {"task_id": 1, "start": 2, "end": 4},
            {"task_id": 2, "start": 3, "end": 6},
            ...
          ]
        }
        """
        # 出力JSON形式内の波括弧は、テンプレートエンジンに変数として解釈されないようダブルブラケットでエスケープ
        response_schemas = [
            ResponseSchema(
                name="durations",
                description=(
                    "各タスクの期間は以下の形式のオブジェクトです。"
                    "例: {{\"durations\": [{{\"task_id\": 0, \"start\": 1, \"end\": 5}}, "
                    "{{\"task_id\": 1, \"start\": 2, \"end\": 4}}, ...]}}"
                    "※ 出力は必ずJSON形式にしてください。"
                ),
                type="object(array(objects))"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
            あなたはプロジェクトタスクの期間算出のエキスパートです。
            以下は全体のプロジェクト期間 {duration} と、各タスクの情報です。
            タスク情報は task_id, task_name, content のみが提供されています。
            タスクの内容から、それぞれの作業期間（開始日と終了日）を算出してください。
            
            タスク一覧:
            {tasks_input}
            
            回答は、厳密に以下のような形式の**JSON形式のみ**で出力してください:
            回答例（イメージ）:
            {{
            "durations": [
                {{ "task_id": 0, "start": 1, "end": 5 }},
                {{ "task_id": 1, "start": 2, "end": 4 }}
            ]
            }}
            
            """,
        )
        # tasks_input: タスク情報リストをJSON形式（見やすい整形付き）に変換
        tasks_input = json.dumps(tasks, ensure_ascii=False, indent=2)
        
        try:
            # LLM呼び出し
            chain = prompt_template | self.llm_pro
            ai_message = chain.invoke({
                "duration": duration, 
                "tasks_input": tasks_input
            })
            raw: str = ai_message.content if hasattr(ai_message, "content") else str(ai_message)
            logger.debug("Raw LLM output: %s", raw)
            
            # JSON修復→パース
            repaired = self._repair_json(raw)
            logger.debug("Repaired JSON: %s", repaired)
            parsed = parser.parse(repaired)
            logger.debug("Parsed result: %s", parsed)
            
            # result が {"durations": [...]} の形式となることを期待
            return parsed.get("durations", [])
        except Exception as e:
            logger.error("タスク期間生成失敗: %s", e, exc_info=True)
            # 失敗時はタスクIDのみ持つ基本的なフォールバックを返す
            return [{"task_id": task["task_id"], "start": 1, "end": 2} for task in tasks]

if __name__ == '__main__':
    # 簡易テスト用サンプル
    tasks = [
        {
            "task_id": 0,
            "task_name": "プロジェクト設計",
            "content": "アプリケーション全体の設計を行う。"
        },
        {
            "task_id": 1,
            "task_name": "データモデル定義 (TODO)",
            "content": "Todoモデルの定義を行う。"
        }
    ]
    service = DurationTaskService()
    try:
        durations = service.generate_task_durations(10, tasks)
        print("Generated Task Durations:")
        print(json.dumps(durations, ensure_ascii=False, indent=2))
    except Exception as e:
        print("Test failed with error:", str(e))
