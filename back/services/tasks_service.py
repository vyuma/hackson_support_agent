from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService

class TasksService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_yume_object_and_task(self, yume_summary: str):
        """
        仕様書からタスクを生成するメソッド。
        """
        # 構造体の設定
        object_response_schemas = [
            ResponseSchema(
                name="Objects", 
                description="配列形式の項目リスト。例: [{Date: string,Object: string}]",
                type="array(objects)"
            )
        ]
        yume_step_response_schemas = [
            ResponseSchema(
                name="tasks",
                description="配列形式の項目リスト。例: [{Date:string, Objects:string, Task:string[]}]",
                type="array(objects)"
            )
        ]

        object_parser = StructuredOutputParser.from_response_schemas(object_response_schemas)
        yume_step_parser = StructuredOutputParser.from_response_schemas(yume_step_response_schemas)

        yume_object_system_prompt = PromptTemplate(
            input_variables=["yume_summary"],
            partial_variables={"format_instructions": object_parser.get_format_instructions()},
            template="""
            仕様書:{yume_summary}
            仕様書をもとに、タスク分割したものを生成してください。
            フォーマットは以下の通りです
            ...
            {format_instructions}
            """
        )

        # タスク生成プロンプト
        yume_task_system_prompt = PromptTemplate(
            partial_variables={
                "format_instructions": yume_step_parser.get_format_instructions(),
                "yume_summary": yume_summary
            },
            input_variables=["yume_object"],
            template="""
            仕様書:{yume_summary}
            中間目標:{yume_object}
            フォーマットは以下の通りです
            {format_instructions}
            """
        )

        object_chain = yume_object_system_prompt | self.flash_exp | object_parser 
        yume_object = object_chain.invoke({"yume_summary": yume_summary})

        # タスク生成
        yume_task_chain = yume_task_system_prompt | self.flash_llm_pro | yume_step_parser 
        yume_task = yume_task_chain.invoke({"yume_object": yume_object})

        return yume_task
