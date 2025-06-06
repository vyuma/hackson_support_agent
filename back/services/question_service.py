from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.schema.runnable import RunnableSequence
from .base_service import BaseService

class QuestionService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_question(self, idea_prompt: str):
        """
        Q&Aの質問と想定回答を生成するメソッド。
        """
        response_schemas = [
            ResponseSchema(
                name="Question",
                description="配列形式の項目リスト。例: {Question:[{Question:string,Answer:string}]}",
                type="array(objects)"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
            あなたはプログラミング初心者のプロダクト開発を補助するハッカソン支援エージェントです。
            ...
            アイデア、期間、人数:{idea_prompt}
            これに基づいたアイデアを仕様に落とし込む上での質問をしてください。
            アイデアが仕様に触れるような具体的な内容であれば3から5個で、抽象的であればそれ以上生成してください。
            ただし、フレームワークの記述は不要です。なんの言語が書けるかなどユーザーのコーディング力には触れても問題ないです。
            また、回答例をAnswerの欄に含めてください。Questionの欄には解答例を書かないでください。
            回答は以下のフォーマットを参照してください。
            {format_instructions}
            """,
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt_template | self.llm_flash_thinking | parser
        result = chain.invoke({"idea_prompt": idea_prompt})
        return {"result": {"Question": result["Question"]}}
