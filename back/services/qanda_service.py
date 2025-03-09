# back/services/qanda_service.py
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.schema.runnable import RunnableSequence
from .base_service import BaseService

class QandaService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_yume_question(self, yume_prompt: str):
        """
        Q&Aの質問と想定回答を生成するメソッド。
        """
        response_schemas = [
            ResponseSchema(
                name="Question",
                description="配列形式の項目リスト。例: {Question:[{Question: string,Anser:string}]}",
                type="array(objects)"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
            あなたは、夢を語る人に対してそれの具体化を支援するためのエージェントです。
            ...
            質問:{yume_prompt}
            回答は以下のフォーマットを参照してください。
            質問が具体的であれば3から5個で、抽象的であればそれ以上生成してください。
            {format_instructions}
            """,
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt_template | self.flash_llm_pro | parser
        result = chain.invoke({"yume_prompt": yume_prompt})
        return result
