from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from .base_service import BaseService

class SummaryService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_yume_summary(self, yume_answer: list[dict]):
        """
        ユーザーのQ&A回答リストから要約を生成する。
        """
        # list[dict] => "Q: 〇〇\nA: 〇〇" のテキストに変換
        yume_answer_str = "\n".join(
            [f"Q: {item['Question']}\nA: {item['Answer']}" for item in yume_answer]
        )
        yume_summary_system_prompt = ChatPromptTemplate.from_template(
            template="""
            あなたは夢を語る人に対してそれの具体化を支援するエージェントです。
            あなたは、夢を具体化するために必要な質問をして次のような回答をユーザーから得ることが出来ました。
            この時に、ユーザーから得た回答をもとに、夢の実現のための要約を作成してください。
            {yume_answer}
            """
        )

        chain = yume_summary_system_prompt | self.flash_exp | StrOutputParser()
        yume_summary = chain.invoke({"yume_answer": yume_answer_str})
        return yume_summary
