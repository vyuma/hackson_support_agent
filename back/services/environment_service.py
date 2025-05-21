from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from .base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class EnvironmentService(BaseService):
    def __init__(self):
        super().__init__()

    def generate_hands_on(self, specification: str, directory: str, framework: str):
        """
            仕様書、ディレクトリ構成、フレームワーク情報に基づいて、以下の4つのハンズオン説明を生成する。
            - overall: 全体の環境構築ハンズオンの説明
            - devcontainer: .devcontainer の使い方と設定内容の詳細説明
            - frontend: フロントエンドの初期環境構築手順の詳細説明
            - backend: バックエンドの初期環境構築手順の詳細説明
            出力はMarkdown形式の文字列とし、JSON形式で返す。
        """
        response_schemas = [
            ResponseSchema(
                name="overall",
                description="全体の環境構築ハンズオンの説明。",
                type="string"
            ),
            ResponseSchema(
                name="devcontainer",
                description=".devcontainer の使い方と設定内容の詳細説明。",
                type="string"
            ),
            ResponseSchema(
                name="frontend",
                description="フロントエンドの初期環境構築手順の詳細説明。（ただし、.devcontainerで整う環境構築を再度ローカルで）",
                type="string"
            ),
            ResponseSchema(
                name="backend",
                description="バックエンドの初期環境構築手順の詳細説明。（ただし、.devcontainerで整う環境構築を再度ローカルで整える必要はありません）",
                type="string"
            )
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        prompt_template = ChatPromptTemplate.from_template(
            template="""
                        以下の情報をもとに、環境構築ハンズオンの説明を生成してください。回答はMarkdown形式で出力してください。
                        ただし、Markdown形式の文字列がJSON形式の形を壊さないように注意してください。
                        【仕様書】
                        {specification}
                        【ディレクトリ構成】
                        {directory}
                        【フレームワーク情報】
                        {framework}
                        Webフレームワークの場合、
                        以下の項目ごとに、詳細なハンズオンの説明を出力してください：
                        1. overall: プロジェクト全体の環境構築ハンズオンの概要説明
                        2. devcontainer: .devcontainer の使い方および具体的な設定内容の説明。中身のDockerfileとdevcontainer.jsonの具体的なコード内容まで含めてください。
                        3. frontend: フロントエンドの初期環境構築手順の詳細な説明（.devcontainerで整う環境構築を再度ローカルで整えるような説明をしないでください。）
                        4. backend: バックエンドの初期環境構築手順の詳細な説明（.devcontainerで整う環境構築を再度ローカルで整えるような説明をしないでください。）
                        
                        Androidの場合、
                        以下の項目ごとに、詳細なハンズオンの説明を出力してください：
                        1. overall: プロジェクト全体の環境構築ハンズオンの概要説明。Android Studioのインストール手順や、必要なSDKのインストール手順を含めてください。
                        2. devcontainer: Android開発では.devcontainerは使用しないため、.devcontainerの説明は不要です。使わない旨の説明をしてください。
                        3. frontend: フロントエンドの初期環境構築手順の詳細な説明
                        4. backend: バックエンドの初期環境構築手順の詳細な説明
                        
                        iOSの場合、
                        以下の項目ごとに、詳細なハンズオンの説明を出力してください：
                        1. overall: プロジェクト全体の環境構築ハンズオンの概要説明。Xcodeのインストール手順や、必要なSDKのインストール手順を含めてください。
                        2. devcontainer: iOS開発では.devcontainerは使用しないため、.devcontainerの説明は不要です。使わない旨の説明をしてください。
                        3. frontend: フロントエンドの初期環境構築手順の詳細な説明
                        4. backend: バックエンドの初期環境構築手順の詳細な説明
                        以下の JSON 形式 **以外** は一切含めず、純粋な JSON オブジェクトだけを返してください。
                        ```json
                        {{
                        "overall": "<全体説明の Markdown 文字列>",
                        "devcontainer": "<.devcontainer 説明の Markdown 文字列>",
                        "frontend": "<フロントエンド手順の Markdown 文字列>",
                        "backend": "<バックエンド手順の Markdown 文字列>"
                        }}
                        '''
                        {format_instructions}
                    """,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        try:
            # LLM呼び出し
            chain = prompt_template | self.llm_flash
            ai_message = chain.invoke({
                "specification": specification,
                "directory": directory,
                "framework": framework
            })
            raw: str = ai_message.content if hasattr(ai_message, "content") else str(ai_message)
            logger.debug("Raw LLM output: %s", raw)

            # JSON修復→パース
            repaired = self._repair_json(raw)
            logger.debug("Repaired JSON: %s", repaired)
            parsed = parser.parse(repaired)
            logger.debug("Parsed result: %s", parsed)

            return parsed
        except Exception as e:
            logger.error("環境構築ハンズオン生成失敗: %s", e, exc_info=True)
            # 失敗時は基本的な情報を持つフォールバック結果を返す
            return {
                "overall": f"環境構築ハンズオン生成に失敗しました: {e}",
                "devcontainer": "生成失敗",
                "frontend": "生成失敗", 
                "backend": "生成失敗"
            }
