from database import engine, Base
from models.project import Project

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("テーブル作成完了")
