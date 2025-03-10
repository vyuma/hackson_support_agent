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
            あなたはプログラミング初心者のプロダクト開発を補助するハッカソン支援エージェントです。
            ...
            アイデア、期間、人数:{yume_prompt}
            これに基づいたアイデアを仕様に落とし込む上での質問をしてください。
            アイデアが具体的であれば3から5個で、抽象的であればそれ以上生成してください。
            回答は以下のフォーマットを参照してください。
            {format_instructions}
            """,
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt_template | self.flash_llm_pro | parser
        result = chain.invoke({"yume_prompt": yume_prompt})
        return {"result": {"Question": result["Question"]}}
