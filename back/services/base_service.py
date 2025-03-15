import os
import tomllib
from dotenv import load_dotenv

# LangChain & Model
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv("/workspaces/hackson_support_agent/back/.env.local")

class BaseService:
    def __init__(self):
        # プロンプトの読み込み
        # with open("./prompts.toml", "rb") as f:
        #     self.prompts = tomllib.load(f)

        self.flash_llm_pro = self._load_llm("gemini-2.0-flash-thinking-exp")
        self.flash_exp = self._load_llm("gemini-2.0-flash")

    def _load_llm(self, model_type: str, temperature=0.5):
        api_key = os.getenv("GOOGLE_API_KEY")
        return ChatGoogleGenerativeAI(
            model=model_type,
            temperature=temperature,
            api_key=api_key
        )
    
    def _get_medium_prompt(self, prompt: str):
        """
        デバッグ用 必要に応じて中間出力の表示をする
        """
        print("Intermediate Output:", prompt)
        return prompt
