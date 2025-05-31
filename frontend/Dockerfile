# 构建阶段
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 配置国内镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 配置 yarn 国内镜像源并安装依赖
RUN yarn config set registry https://registry.npmmirror.com && \
    yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产阶段
FROM caddy:2-alpine

# 复制构建产物到caddy目录
COPY --from=build /app/build /usr/share/caddy

# 复制caddy配置
COPY Caddyfile /etc/caddy/Caddyfile

# 暴露端口
EXPOSE 80

# 启动caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]