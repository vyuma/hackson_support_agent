import os
import time
import logging
import tomllib
from dotenv import load_dotenv

# LangChain & Model
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from typing import List, Dict

from json_repair import repair_json

load_dotenv("/workspaces/hackson_support_agent/back/.env.local")

logger = logging.getLogger(__name__)

class BaseService:
    def __init__(self,defult_model_provider: str = "google"):
        """
        model_provider: モデルのプロバイダを指定する。デフォルトはGoogle。
        - google: Google Gemini
        - openai: OpenAI
        - anthropic: Anthropic
        
        などのデフォルトプロパイダーを指定することが出来る
        もし必要ならば、プロバイダーを増加させることも継承クラスで行うことが可能になる。
        """
        
        # プロンプトの読み込み
        # with open("./prompts.toml", "rb") as f:
        #     self.prompts = tomllib.load(f)
        
        # AIモデルの初期化
        
        # proモデル
        self.llm_pro = self._load_llm(defult_model_provider,"gemini-2.0-flash")
        # flashモデル
        self.llm_flash = self._load_llm(defult_model_provider,"gemini-2.0-flash")
        # flash-thinkingモデル 仕様運転版
        self.llm_flash_thinking = self._load_llm(defult_model_provider,"gemini-2.0-flash-thinking-exp")
        # flash-liteモデル
        self.llm_lite = self._load_llm(defult_model_provider,"ggemini-2.0-flash-lite")
    
    def _load_llm(self,model_provider ,model_type: str,temperature=0.5):
        
        match model_provider:
            case "google":
                api_key = os.getenv("GOOGLE_API_KEY")
                return ChatGoogleGenerativeAI(
                    model=model_type,
                    temperature=temperature,
                    api_key=api_key
                )
            case "openai":
                api_key = os.getenv("OPENAI_API_KEY")
                return ChatOpenAI(
                    model=model_type,
                    temperature=temperature,
                    openai_api_key=api_key
                )
            case "anthropic":
                api_key = os.getenv("ANTHROPIC_API_KEY")
                return ChatAnthropic(
                    model=model_type,
                    temperature=temperature,
                    anthropic_api_key=api_key
                )
    
    def _repair_json(self, raw: str) -> str:
        """
        生の LLM 応答を json_repair で修復し、修復後の文字列を返す。
        失敗時にはエラーをログに出して例外を再スロー。
        """
        try:
            repaired = repair_json(raw)
            logger.debug("JSON repaired successfully: %s", repaired)
            return repaired
        except Exception as e:
            logger.error("json_repair に失敗しました: %s", e, exc_info=True)
            raise

    def _sleep_rate_limit(self):
        """
        必要に応じて呼び出し間隔をあける。
        """
        time.sleep(self.rate_limit_sec)



