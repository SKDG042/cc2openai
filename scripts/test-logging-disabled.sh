#!/bin/bash

# 测试日志禁用功能
echo "测试日志禁用功能..."

# 测试1: 不设置 LOGGING_DISABLED 环境变量（应该有日志输出）
echo "测试1: 不设置 LOGGING_DISABLED 环境变量"
cd deno-proxy && timeout 5s deno run --allow-env --allow-net --allow-read --allow-write src/main.ts &
PID1=$!
sleep 2
echo "发送测试请求..."
curl -s -X POST http://localhost:8000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }' > /dev/null
sleep 2
kill $PID1 2>/dev/null
wait $PID1 2>/dev/null

echo ""
echo "测试2: 设置 LOGGING_DISABLED=true（应该没有日志输出)"
# 测试2: 设置 LOGGING_DISABLED=true 环境变量（应该没有日志输出）
LOGGING_DISABLED=true timeout 5s deno run --allow-env --allow-net --allow-read --allow-write src/main.ts &
PID2=$!
sleep 2
echo "发送测试请求..."
curl -s -X POST http://localhost:8000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }' > /dev/null
sleep 2
kill $PID2 2>/dev/null
wait $PID2 2>/dev/null

echo ""
echo "测试完成！"