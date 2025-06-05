# ================== 阶段 1: 构建前端 ==================
FROM node:18-alpine AS frontend-build

WORKDIR /app

# 替换为阿里云源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装依赖
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn config set registry https://registry.npmmirror.com  && \
    yarn install --frozen-lockfile

# 构建前端
COPY frontend/. .
RUN yarn build


# ================== 阶段 2: 构建后端 ==================
FROM python:3.11-slim AS backend-build

WORKDIR /app

# 使用阿里云镜像源加速 apt 安装
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装系统依赖
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY backend/requirements.txt .
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple  && \
    pip install --no-cache-dir -r requirements.txt && \
    whereis uvicorn

# 复制后端代码
COPY backend/. .


# ================== 阶段 3: 最终运行容器 ==================
FROM python:3.11-slim

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_FILE=data/rollcall.db
ENV ADMIN_USER=admin
ENV ADMIN_PASSWORD=123456

WORKDIR /app

# 添加 Caddy 源并安装 Caddy（使用 apt）

# 使用阿里云镜像源加速 apt 安装
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && \
    #apt-get install -y debian-keyring debian-archive-keyring && \
    #curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key'  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
    #curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt'  > /etc/apt/sources.list.d/caddy-stable.list && \
    #apt-get update && \
    apt-get install -y caddy && \
    rm -rf /var/lib/apt/lists/*

# 拷贝前端构建结果到 Caddy 默认网站目录
COPY --from=frontend-build /app/build /usr/share/caddy

# 拷贝 Python 后端应用到容器中
COPY --from=backend-build /app /app
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-build /usr/local/bin/uvicorn /usr/local/bin/uvicorn
# 拷贝外部 Caddyfile 到容器中
COPY Caddyfile /etc/caddy/Caddyfile

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 80

# 启动命令：后台运行 uvicorn，前台运行 caddy
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 & caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]