from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from pydantic.alias_generators import to_camel

# 定义统一的 BaseSchema，启用 camelCase 别名
class BaseSchema(BaseModel):
    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,  # 允许通过原始 snake_case 字段访问
    }

# 用户相关模式
class UserBase(BaseSchema):
    username: str
    email: EmailStr
    user_type: str = "teacher"

class UserCreate(BaseSchema):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    user_type: Optional[str] = None
    password: Optional[str] = None

class UserProfile(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    new_password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# 登录相关模式
class Token(BaseSchema):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseSchema):
    username: Optional[str] = None

class LoginRequest(BaseSchema):
    username: str
    password: str

# 学生相关模式
class StudentBase(BaseSchema):
    student_id: str
    name: str
    weight: float = 1.0

class StudentCreate(StudentBase):
    group_id: int

class StudentUpdate(BaseSchema):
    student_id: Optional[str] = None
    name: Optional[str] = None
    weight: Optional[float] = None

class Student(StudentBase):
    id: int
    group_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# 分组相关模式
class GroupBase(BaseSchema):
    name: str

class GroupCreate(GroupBase):
    class_id: int

class GroupUpdate(BaseSchema):
    name: Optional[str] = None

class Group(GroupBase):
    id: int
    class_id: int
    created_at: datetime
    students: List[Student] = []
    
    class Config:
        from_attributes = True

# 班级相关模式
class ClassBase(BaseSchema):
    name: str

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseSchema):
    name: Optional[str] = None

class Class(ClassBase):
    id: int
    owner_id: int
    created_at: datetime
    groups: List[Group] = []
    
    class Config:
        from_attributes = True

# 点名记录相关模式
class RollCallRecordCreate(BaseSchema):
    student_id: int
    class_id: int

class RollCallRecord(BaseSchema):
    id: int
    student_id: int
    class_id: int
    called_at: datetime
    student: Student
    class_obj: Class
    group_obj: Group

    class Config:
        from_attributes = True

# 响应模式
class Message(BaseSchema):
    message: str

class ErrorResponse(BaseSchema):
    detail: str