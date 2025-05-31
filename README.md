# 智能点名系统

一个基于 React + FastAPI 的现代化点名管理系统，支持班级管理、分组点名、数据统计等功能。

## ✨ 新增功能

### 🔐 安全密码修改
- 用户可以安全地修改自己的密码
- 需要验证旧密码才能设置新密码
- API 端点：`PUT /auth/change-password`

### 🐳 Docker 容器化部署
- 完整的 Docker 部署方案
- 前后端服务自动编排
- 一键启动整个系统

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd test111

# 2. 一键启动
docker-compose up -d --build

# 3. 访问应用
# 前端：http://localhost
# 后端 API：http://localhost:8000
# API 文档：http://localhost:8000/docs
```

### 方式二：本地开发

```bash
# 启动后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 启动前端（新终端）
cd frontend
yarn install
yarn start
```

## 📋 功能特性

- **用户管理**：支持管理员和教师角色
- **班级管理**：创建和管理班级信息
- **分组管理**：灵活的学生分组功能
- **智能点名**：支持批量点名和记录
- **数据统计**：点名历史和统计分析
- **安全认证**：JWT Token 认证机制
- **密码管理**：安全的密码修改功能

## 🛠 技术栈

### 前端
- React 18
- Tailwind CSS
- Axios
- React Router

### 后端
- FastAPI
- SQLAlchemy
- SQLite
- JWT 认证
- Pydantic

### 部署
- Docker
- Docker Compose
- Nginx

## 📖 详细文档

- [部署指南](DEPLOYMENT.md) - 完整的 Docker 部署说明
- [API 文档](http://localhost:8000/docs) - 启动后端后访问

## 🔑 默认账号

- **管理员**：`admin` / `admin123`
- **教师**：`teacher` / `teacher123`

⚠️ **生产环境请立即修改默认密码！**

## 🐳 Docker 命令

```bash
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建
docker-compose up -d --build
```

## 📁 项目结构

```
test111/
├── backend/                 # FastAPI 后端
│   ├── main.py             # 主应用文件
│   ├── auth.py             # 认证模块
│   ├── models.py           # 数据模型
│   ├── schemas.py          # Pydantic 模式
│   ├── database.py         # 数据库配置
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile          # 后端 Docker 配置
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   └── contexts/       # React Context
│   ├── package.json        # 前端依赖
│   ├── Dockerfile          # 前端 Docker 配置
│   └── nginx.conf          # Nginx 配置
├── docker-compose.yml      # Docker 编排文件
├── DEPLOYMENT.md           # 部署指南
└── README.md               # 项目说明
```

## 🔧 开发指南

### 添加新功能

1. **后端 API**：在 `backend/main.py` 中添加新的路由
2. **数据模型**：在 `backend/models.py` 中定义数据结构
3. **前端服务**：在 `frontend/src/services/api.js` 中添加 API 调用
4. **前端组件**：在 `frontend/src/components/` 中创建新组件

### 修改密码功能使用

```javascript
// 前端调用示例
import api from './services/api';

const handleChangePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.changePassword({
      oldPassword,
      newPassword
    });
    alert('密码修改成功！');
  } catch (error) {
    alert('密码修改失败：' + error.message);
  }
};
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🆘 支持

如果遇到问题，请：

1. 查看 [部署指南](DEPLOYMENT.md)
2. 检查 [常见问题](DEPLOYMENT.md#故障排除)
3. 提交 Issue

---

**开始使用智能点名系统，让课堂管理更高效！** 🎓