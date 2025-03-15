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
            [f"Q: {item.dict()['Question']}\nA: {item.dict()['Answer']}" for item in yume_answer]
        )


        yume_summary_system_prompt = ChatPromptTemplate.from_template(
            template="""
            あなたはプログラミング初心者のプロダクト開発を補助するハッカソン支援エージェントです。
            あなたは、プロダクト制作のための具体的な必要になる仕様の質問をして次のような回答をユーザーから得ることが出来ました。
            この時に、ユーザーから得た回答をもとに、プロダクト開発のための完全な仕様書を作成してください。
            この仕様書をもとにフレームワークを決定するのでフレームワークの記述は不要です。
            マークダウン形式の仕様書のみを返してください。
            {yume_answer}
            """
        )

        chain = yume_summary_system_prompt | self.flash_llm_pro | StrOutputParser()
        yume_summary = chain.invoke({"yume_answer": yume_answer_str})
        return yume_summary
