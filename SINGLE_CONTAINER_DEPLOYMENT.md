# 单容器部署指南

本文档介绍如何使用单个Docker容器同时运行前后端代码。

## 概述

新的部署方式将前后端代码打包到一个Docker容器中：
- 前端：React应用构建为静态文件
- 后端：FastAPI服务器同时提供API和静态文件服务
- 数据库：SQLite文件存储

## 构建和运行

### 方式一：使用Docker Compose（推荐）

```bash
# 使用单容器配置文件
docker-compose -f docker-compose-single.yml up --build
```

### 方式二：直接使用Docker

```bash
# 构建镜像
docker build -t rollcall-app .

# 运行容器
docker run -d \
  --name rollcall-app \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e DB_FILE=rollcall.db \
  -e ADMIN_USER=admin \
  -e ADMIN_PASSWORD=123456 \
  rollcall-app
```

## 访问应用

应用启动后，可以通过以下地址访问：

- **前端界面**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **API接口**: http://localhost:8000/api/*

## 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_FILE` | `rollcall.db` | 数据库文件名 |
| `ADMIN_USER` | `admin` | 管理员用户名 |
| `ADMIN_PASSWORD` | `123456` | 管理员密码 |

## 数据持久化

数据库文件存储在容器的 `/app/data` 目录中，通过Docker卷映射到宿主机的 `./data` 目录，确保数据持久化。

## 架构说明

### 多阶段构建

1. **前端构建阶段**：使用Node.js镜像构建React应用
2. **生产阶段**：使用Python镜像运行FastAPI服务器，并包含前端静态文件

### 路由处理

- API路由（`/api/*`, `/auth/*`, `/docs`, `/redoc`）：由FastAPI处理
- 静态资源：直接提供文件
- 其他路径：返回`index.html`（支持React Router）

## 与原有部署方式的对比

| 特性 | 原有方式（双容器） | 新方式（单容器） |
|------|-------------------|------------------|
| 容器数量 | 2个（前端+后端） | 1个 |
| 资源占用 | 较高 | 较低 |
| 部署复杂度 | 中等 | 简单 |
| 扩展性 | 好（可独立扩展） | 一般 |
| 适用场景 | 生产环境 | 开发/小型部署 |

## 故障排除

### 常见问题

1. **前端页面无法访问**
   - 检查静态文件是否正确构建到 `/app/static` 目录
   - 查看容器日志：`docker logs rollcall-app`

2. **API接口无法访问**
   - 确认端口映射正确：`-p 8000:8000`
   - 检查防火墙设置

3. **数据库初始化失败**
   - 检查数据目录权限
   - 查看环境变量配置

### 查看日志

```bash
# 查看容器日志
docker logs rollcall-app

# 实时查看日志
docker logs -f rollcall-app
```

## 开发建议

对于开发环境，建议继续使用原有的双容器方式（`docker-compose.yml`），因为：
- 前端热重载更方便
- 可以独立重启前后端服务
- 调试更容易

单容器方式更适合：
- 生产环境的简单部署
- 资源受限的环境
- 演示和测试环境