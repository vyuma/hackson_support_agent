import os
from typing import List
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser


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
print(parser.get_format_instructions())