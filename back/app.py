from dotenv import load_dotenv
from fastapi import FastAPI, responses
from pydantic import BaseModel
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os

# アプリケーション
from yume_prompt_agent import YumeService


class Input(BaseModel):
    input: str

class Output(BaseModel):
    output: str

class YumeQA(BaseModel):
    Question : str
    Answer : str

class YumeAnswer(BaseModel):
    Answer : list[YumeQA]

class YumePrompt(BaseModel):
    Prompt : str

class YumeSummary(BaseModel):
    Summary : str


app = FastAPI(title='LangChain Server', version='1.0')

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yume_agent = YumeService()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/yume_question")
async def generate_yume_question(yume_prompt:YumePrompt):
    
    yume_question = yume_agent.generate_yume_question(yume_prompt.Prompt)
    # json形式で返答する
    return responses.JSONResponse(content=yume_question,media_type="application/json")

@app.post("/api/yume_summary")
async def generate_yume_summery(yume_answer:YumeAnswer):
    yume_answer=yume_answer.model_dump()["Answer"]
    print(yume_answer)
    summary = yume_agent.generate_yume_summary_agent(yume_answer)
    return summary

@app.post("/api/get_object_and_tasks")
async def generate_yume_object_and_tasks(yume_summary:YumeSummary):
    object_and_tasks = yume_agent.generate_yume_object_and_task(yume_summary.Summary)
    return responses.JSONResponse(content=object_and_tasks,media_type="application/json")





if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='localhost', port=8000)