FROM denoland/deno:alpine

WORKDIR /app

# 复制依赖配置文件（不复制 lockfile，避免版本兼容问题）
COPY deno.json ./

# 复制源代码
COPY deno-proxy/ ./deno-proxy/

# 缓存依赖
RUN deno cache deno-proxy/src/main.ts

# 暴露端口（实际端口由 PORT 环境变量控制）
EXPOSE 4042

# 运行服务
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "deno-proxy/src/main.ts"]
