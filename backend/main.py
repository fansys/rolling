import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from pathlib import Path

from database import get_db, create_tables
from models import User, Class, Group, Student, RollCallRecord
from schemas import (
    UserCreate, UserUpdate, UserProfile, User as UserSchema,
    LoginRequest, Token, Message, ChangePasswordRequest, ResetPasswordRequest,
    ClassCreate, ClassUpdate, Class as ClassSchema,
    GroupCreate, GroupUpdate, Group as GroupSchema,
    StudentCreate, StudentUpdate, Student as StudentSchema,
    RollCallRecordCreate, RollCallRecord as RollCallRecordSchema
)
from auth import (
    authenticate_user, create_access_token, get_password_hash, verify_password,
    get_current_active_user, get_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="智能点名系统 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件服务
static_dir = Path("/app/static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    
    # 为前端路由提供index.html
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # API路由不处理
        if full_path.startswith("api/") or full_path.startswith("auth/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # 检查是否为静态资源
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # 对于其他路径，返回index.html（用于React Router）
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        
        raise HTTPException(status_code=404, detail="Not found")

# 初始化数据库和管理员用户
def initialize_database():
    """初始化数据库表和管理员用户"""
    # 创建数据库表
    create_tables()
    
    # 从环境变量获取管理员账户信息
    admin_username = os.getenv("ADMIN_USER", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "123456")
    
    # 创建默认管理员用户（如果不存在）
    db = next(get_db())
    try:
        admin_user = db.query(User).filter(User.username == admin_username).first()
        if not admin_user:
            admin_user = User(
                username=admin_username,
                email=f"{admin_username}@example.com",
                hashed_password=get_password_hash(admin_password),
                user_type="admin"
            )
            db.add(admin_user)
            db.commit()
            print(f"管理员用户 '{admin_username}' 创建成功")
        else:
            print(f"管理员用户 '{admin_username}' 已存在")
    finally:
        db.close()

# 启动时初始化数据库
@app.on_event("startup")
def startup_event():
    initialize_database()

@app.get("/")
def read_root():
    return {"msg": "智能点名系统 FastAPI 后端已启动"}

# 认证相关API
@app.post("/auth/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.put("/auth/profile", response_model=UserSchema)
def update_profile(profile_data: UserProfile, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if profile_data.email:
        # 检查邮箱是否已存在
        existing_user = db.query(User).filter(User.email == profile_data.email, User.id != current_user.id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="邮箱已存在")
        current_user.email = profile_data.email
    
    if profile_data.password:
        current_user.hashed_password = get_password_hash(profile_data.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.put("/auth/change-password", response_model=Message)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """修改当前用户密码"""
    # 验证旧密码
    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="旧密码不正确")
    
    # 更新密码
    hashed_password = get_password_hash(request.new_password)
    current_user.hashed_password = hashed_password
    db.commit()
    
    return {"message": "密码修改成功"}

@app.put("/users/{user_id}/reset-password", response_model=Message)
def reset_user_password(
    user_id: int,
    request: ResetPasswordRequest,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """管理员重置用户密码"""
    # 查找目标用户
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 更新密码
    hashed_password = get_password_hash(request.new_password)
    target_user.hashed_password = hashed_password
    db.commit()
    
    return {"message": "密码重置成功"}

# 用户管理API（仅管理员）
@app.get("/users", response_model=List[UserSchema])
def get_users(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/users", response_model=UserSchema)
def create_user(user_data: UserCreate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="邮箱已存在")
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        user_type=user_data.user_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_data: UserUpdate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if user_data.email:
        # 检查邮箱是否已存在
        existing_email = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="邮箱已存在")
        db_user.email = user_data.email
    
    if user_data.user_type:
        db_user.user_type = user_data.user_type
    
    if user_data.password:
        db_user.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}", response_model=Message)
def delete_user(user_id: int, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if db_user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    
    db.delete(db_user)
    db.commit()
    return {"message": "用户删除成功"}

# 班级管理API
@app.get("/classes", response_model=List[ClassSchema])
def get_classes(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Class).filter(Class.owner_id == current_user.id).all()

@app.post("/classes", response_model=ClassSchema)
def create_class(class_data: ClassCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_class = Class(
        name=class_data.name,
        owner_id=current_user.id
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@app.put("/classes/{class_id}", response_model=ClassSchema)
def update_class(class_id: int, class_data: ClassUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_class = db.query(Class).filter(Class.id == class_id, Class.owner_id == current_user.id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    if class_data.name:
        db_class.name = class_data.name
    
    db.commit()
    db.refresh(db_class)
    return db_class

@app.delete("/classes/{class_id}", response_model=Message)
def delete_class(class_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_class = db.query(Class).filter(Class.id == class_id, Class.owner_id == current_user.id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    db.delete(db_class)
    db.commit()
    return {"message": "班级删除成功"}

# 分组管理API
@app.get("/classes/{class_id}/groups", response_model=List[GroupSchema])
def get_groups(class_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 验证班级所有权
    db_class = db.query(Class).filter(Class.id == class_id, Class.owner_id == current_user.id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    return db.query(Group).filter(Group.class_id == class_id).all()

@app.post("/groups", response_model=GroupSchema)
def create_group(group_data: GroupCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 验证班级所有权
    db_class = db.query(Class).filter(Class.id == group_data.class_id, Class.owner_id == current_user.id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    db_group = Group(
        name=group_data.name,
        class_id=group_data.class_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.put("/groups/{group_id}", response_model=GroupSchema)
def update_group(group_id: int, group_data: GroupUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_group = db.query(Group).join(Class).filter(Group.id == group_id, Class.owner_id == current_user.id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="分组不存在")
    
    if group_data.name:
        db_group.name = group_data.name
    
    db.commit()
    db.refresh(db_group)
    return db_group

@app.delete("/groups/{group_id}", response_model=Message)
def delete_group(group_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_group = db.query(Group).join(Class).filter(Group.id == group_id, Class.owner_id == current_user.id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="分组不存在")
    
    db.delete(db_group)
    db.commit()
    return {"message": "分组删除成功"}

# 学生管理API
@app.get("/groups/{group_id}/students", response_model=List[StudentSchema])
def get_students(group_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 验证分组所有权
    db_group = db.query(Group).join(Class).filter(Group.id == group_id, Class.owner_id == current_user.id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="分组不存在")
    
    return db.query(Student).filter(Student.group_id == group_id).all()

@app.post("/students", response_model=StudentSchema)
def create_student(student_data: StudentCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 验证分组所有权
    db_group = db.query(Group).join(Class).filter(Group.id == student_data.group_id, Class.owner_id == current_user.id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="分组不存在")
    
    db_student = Student(
        student_id=student_data.student_id,
        name=student_data.name,
        weight=student_data.weight,
        group_id=student_data.group_id
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.put("/students/{student_id}", response_model=StudentSchema)
def update_student(student_id: int, student_data: StudentUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_student = db.query(Student).join(Group).join(Class).filter(Student.id == student_id, Class.owner_id == current_user.id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="学生不存在")
    
    if student_data.student_id:
        db_student.student_id = student_data.student_id
    if student_data.name:
        db_student.name = student_data.name
    if student_data.weight is not None:
        db_student.weight = student_data.weight
    
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/students/{student_id}", response_model=Message)
def delete_student(student_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_student = db.query(Student).join(Group).join(Class).filter(Student.id == student_id, Class.owner_id == current_user.id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="学生不存在")
    
    db.delete(db_student)
    db.commit()
    return {"message": "学生删除成功"}

# 点名相关API
@app.post("/roll-call", response_model=RollCallRecordSchema)
def create_roll_call_record(record_data: RollCallRecordCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 验证学生和班级所有权
    db_student = db.query(Student).join(Group).join(Class).filter(Student.id == record_data.student_id, Class.owner_id == current_user.id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="学生不存在")
    
    db_class = db.query(Class).filter(Class.id == record_data.class_id, Class.owner_id == current_user.id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    db_record = RollCallRecord(
        student_id=record_data.student_id,
        group_id=db_student.group_id,
        class_id=record_data.class_id
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/roll-call/history", response_model=List[RollCallRecordSchema])
def get_roll_call_history(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(RollCallRecord).join(Class).join(Group).filter(Class.owner_id == current_user.id).all()