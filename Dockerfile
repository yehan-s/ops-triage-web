## Multi-stage Dockerfile for ops-triage web (Vite + React)
## 说明：构建期注入 VITE_API_BASE_URL，运行期使用 Nginx 托管静态，并反代 /api 到 server

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json tsconfig.json vite.config.ts index.html ./
# 如有 pnpm-lock.yaml，可加入以下行增强可复现性
# COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile=false

# 默认同域反代：/api → server:7000；可在构建时覆盖
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY src ./src
RUN pnpm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

