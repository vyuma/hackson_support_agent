import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# エンジンの作成
engine = create_engine(DATABASE_URL, echo=False)

# セッション作成用のファクトリ
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy のベースクラス（モデル定義で継承する）
Base = declarative_base()
