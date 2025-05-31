# 智能点名系统 Docker 部署指南

## 概述

本项目提供了完整的 Docker 容器化部署方案，包括前端 React 应用和后端 FastAPI 服务。

## 新增功能

### 🔐 修改密码功能

- **API 端点**: `PUT /auth/change-password`
- **功能**: 用户可以安全地修改自己的密码
- **验证**: 需要提供旧密码进行验证
- **前端集成**: 已在 API 服务中添加 `changePassword` 方法

#### 使用方式

```javascript
// 前端调用示例
import api from './services/api';

const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.changePassword({
      oldPassword: oldPassword,
      newPassword: newPassword
    });
    console.log('密码修改成功:', response.message);
  } catch (error) {
    console.error('密码修改失败:', error.message);
  }
};
```

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React)       │    │   (FastAPI)     │
│   Port: 80      │────│   Port: 8000    │
│   Nginx         │    │   Python 3.11   │
└─────────────────┘    └─────────────────┘
```

## 快速部署

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 一键部署

```bash
# 克隆项目（如果还没有）
git clone <repository-url>
cd test111

# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 访问应用

- **前端应用**: http://localhost
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 详细部署步骤

### 1. 环境准备

```bash
# 检查 Docker 版本
docker --version
docker-compose --version

# 确保 Docker 服务运行
sudo systemctl start docker  # Linux
# 或在 macOS/Windows 启动 Docker Desktop
```

### 2. 构建镜像

```bash
# 构建后端镜像
docker build -t rollcall-backend ./backend

# 构建前端镜像
docker build -t rollcall-frontend ./frontend
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 或者分别启动
docker-compose up -d backend
docker-compose up -d frontend
```

### 4. 验证部署

```bash
# 检查容器状态
docker-compose ps

# 检查后端健康状态
curl http://localhost:8000/

# 检查前端
curl http://localhost/
```

## 服务配置

### 后端服务 (FastAPI)

- **镜像**: Python 3.11-slim
- **端口**: 8000
- **数据持久化**: `./backend/data` 挂载到容器 `/app/data`
- **健康检查**: 每30秒检查一次

### 前端服务 (React + Nginx)

- **构建镜像**: Node.js 18-alpine
- **运行镜像**: Nginx Alpine
- **端口**: 80
- **反向代理**: 自动代理 API 请求到后端

## 环境变量配置

### 后端环境变量

```bash
# 在 docker-compose.yml 中配置
environment:
  - PYTHONPATH=/app
  - SECRET_KEY=your-secret-key-here  # 生产环境请修改
  - DATABASE_URL=sqlite:///./data/rollcall.db
```

### 前端环境变量

```bash
# 在构建时配置
ENV REACT_APP_API_URL=http://localhost:8000
```

## 数据持久化

### 数据库文件

```bash
# 数据库文件位置
./backend/data/rollcall.db

# 备份数据库
cp ./backend/data/rollcall.db ./backup/rollcall_$(date +%Y%m%d_%H%M%S).db

# 恢复数据库
cp ./backup/rollcall_20240101_120000.db ./backend/data/rollcall.db
```

## 常用操作

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近100行日志
docker-compose logs --tail=100 backend
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 停止并删除镜像
docker-compose down --rmi all
```

## 生产环境配置

### 安全配置

1. **修改默认密码**
   ```bash
   # 登录系统后立即修改管理员密码
   # 默认账号: admin / admin123
   ```

2. **更新 JWT 密钥**
   ```python
   # 在 backend/auth.py 中修改
   SECRET_KEY = "your-production-secret-key-here"
   ```

3. **配置 HTTPS**
   ```nginx
   # 在 nginx.conf 中添加 SSL 配置
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

### 性能优化

1. **资源限制**
   ```yaml
   # 在 docker-compose.yml 中添加
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
       reservations:
         cpus: '0.5'
         memory: 512M
   ```

2. **数据库优化**
   ```bash
   # 定期备份数据库
   # 监控数据库大小
   # 考虑使用 PostgreSQL 替代 SQLite
   ```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :80
   lsof -i :8000
   
   # 修改端口映射
   # 在 docker-compose.yml 中修改 ports 配置
   ```

2. **容器启动失败**
   ```bash
   # 查看详细错误信息
   docker-compose logs backend
   
   # 检查镜像构建
   docker build --no-cache -t rollcall-backend ./backend
   ```

3. **数据库连接问题**
   ```bash
   # 检查数据目录权限
   ls -la ./backend/data/
   
   # 重新创建数据库
   rm ./backend/data/rollcall.db
   docker-compose restart backend
   ```

4. **前端无法访问后端**
   ```bash
   # 检查网络连接
   docker network ls
   docker network inspect rollcall-network
   
   # 测试容器间通信
   docker exec rollcall-frontend ping backend
   ```

### 监控和维护

```bash
# 监控容器资源使用
docker stats

# 检查容器健康状态
docker-compose ps

# 清理系统
docker system prune -f

# 查看磁盘使用
docker system df
```

## 扩展部署

### 负载均衡

```yaml
# docker-compose.yml 扩展配置
backend:
  deploy:
    replicas: 3
  
frontend:
  deploy:
    replicas: 2
```

### 外部数据库

```yaml
# 使用 PostgreSQL
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rollcall
      POSTGRES_USER: rollcall
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## 支持和维护

- **日志位置**: `/var/log/docker/`
- **配置文件**: `docker-compose.yml`
- **数据备份**: 建议每日备份数据库文件
- **更新策略**: 建议在维护窗口期间更新

---

**部署完成后，请访问 http://localhost 开始使用智能点名系统！**

默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`

**⚠️ 生产环境部署前请务必修改默认密码和 JWT 密钥！**