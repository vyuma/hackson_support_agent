from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# APIルーターのインポート
from routers import qanda, summary, tasks, framework, directory, environment, projects, taskDetail

app = FastAPI(
    title="LangChain Server",
    version="1.0"
)

# CORS設定
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

# APIルーターの登録
app.include_router(projects.router)
app.include_router(qanda.router, prefix="/api/yume_question", tags=["Q&A"])
app.include_router(summary.router, prefix="/api/yume_summary", tags=["Summary"])
app.include_router(tasks.router, prefix="/api/get_object_and_tasks", tags=["Tasks"])
app.include_router(framework.router, prefix="/api/framework", tags=["Framework"])
app.include_router(directory.router, prefix="/api/directory", tags=["Directory"])
app.include_router(environment.router, prefix="/api/environment", tags=["Environment"])
app.include_router(taskDetail.router, prefix="/api/taskDetail", tags=["TaskDetail"])
# 適宜追加

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='localhost', port=8000)
