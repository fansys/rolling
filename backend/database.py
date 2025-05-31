import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# SQLite 数据库配置 - 从环境变量读取
DB_FILE = os.getenv("DB_FILE", "data/rollcall.db")
# 判断是否为绝对路径
if not os.path.isabs(DB_FILE):
    # 如果是相对路径，则拼接默认目录 /app/data
    DB_FILE = os.path.join(".", DB_FILE)

# 确保目录存在（可选）
os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)

# 构造数据库 URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建数据库表
def create_tables():
    Base.metadata.create_all(bind=engine)

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()