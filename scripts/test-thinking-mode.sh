#!/bin/bash

# 测试 deno-proxy 的思考模式功能
# 发送带有思考配置的 Anthropic 格式请求到 http://localhost:3456/v1/messages

echo "🔧 测试 deno-proxy 思考模式功能..."
echo ""

# 发送带有思考模式的请求并打印响应
curl -X POST http://localhost:3456/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-key" \
  -d '{
    "model": "claude-4.5-sonnet-cc",
    "messages": [
      {
        "role": "user",
        "content": "请解释一下量子计算的基本原理"
      }
    ],
    "system": [
      {
        "type": "text",
        "text": "You are a helpful assistant."
      }
    ],
    "max_tokens": 1024,
    "temperature": 1,
    "stream": true,
    "thinking": {
      "type": "enabled",
      "budget_tokens": 2000
    }
  }' \
  --no-buffer

echo ""
echo "✅ 思考模式测试完成"