# 多阶段构建：前端构建阶段
FROM node:18-alpine as frontend-build

# 设置工作目录
WORKDIR /app/frontend

# 配置国内镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 复制前端 package.json 和 yarn.lock
COPY frontend/package.json frontend/yarn.lock ./

# 配置 yarn 国内镜像源并安装依赖
RUN yarn config set registry https://registry.npmmirror.com && \
    yarn install --frozen-lockfile

# 复制前端源代码
COPY frontend/ .

# 构建前端应用
RUN yarn build

# 生产阶段：Python + 静态文件服务
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_FILE=rollcall.db
ENV ADMIN_USER=admin
ENV ADMIN_PASSWORD=123456

# 配置国内镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖文件
COPY backend/requirements.txt .

# 配置 pip 国内镜像源并安装 Python 依赖
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && \
    pip install --no-cache-dir -r requirements.txt

# 复制后端应用代码
COPY backend/ .

# 从前端构建阶段复制构建产物
COPY --from=frontend-build /app/frontend/build /app/static

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]