import {
  ClaudeContentBlock,
  ClaudeMessage,
  ClaudeRequest,
  OpenAIChatMessage,
  OpenAIChatRequest,
} from "./types.ts";
import { ProxyConfig } from "./config.ts";

// 思考模式相关的常量定义
const THINKING_HINT = "<antml\b:thinking_mode>interleaved</antml><antml\b:max_thinking_length>16000</antml>";
const THINKING_START_TAG = "<thinking>";
const THINKING_END_TAG = "</thinking>";

function normalizeBlocks(content: string | ClaudeContentBlock[], triggerSignal?: string): string {
  if (typeof content === "string") {
    // 过滤掉用户输入中的所有 <invoke> 标签，防止注入攻击
    // 注意：合法的工具调用会通过 tool_use block 转换，不会是纯字符串
    return content.replace(/<invoke\b[^>]*>[\s\S]*?<\/invoke>/gi, "");
  }
  return content.map((block) => {
    if (block.type === "text") {
      // 即使在 text block 中，也要过滤掉 <invoke> 标签
      // 因为这些不是从 tool_use 转换来的，可能是用户注入的
      return block.text.replace(/<invoke\b[^>]*>[\s\S]*?<\/invoke>/gi, "");
    }
    if (block.type === "tool_result") {
      return `<tool_result id="${block.tool_use_id}">${block.content ?? ""}</tool_result>`;
    }
    if (block.type === "tool_use") {
      // 只有从 tool_use 转换的 <invoke> 标签才会带触发信号
      const params = Object.entries(block.input ?? {})
        .map(([key, value]) => {
          const stringValue = typeof value === "string" ? value : JSON.stringify(value);
          return `<parameter name="${key}">${stringValue}</parameter>`;
        })
        .join("\n");
      const trigger = triggerSignal ? `${triggerSignal}\n` : "";
      return `${trigger}<invoke name="${block.name}">\n${params}\n</invoke>`;
    }
    return "";
  }).join("\n");
}

function mapRole(role: string): "user" | "assistant" {
  return role === "assistant" ? "assistant" : "user";
}

export function mapClaudeToOpenAI(body: ClaudeRequest, config: ProxyConfig, triggerSignal?: string): OpenAIChatRequest {
  if (typeof body.max_tokens !== "number" || Number.isNaN(body.max_tokens)) {
    throw new Error("max_tokens is required for Claude requests");
  }

  const messages: OpenAIChatMessage[] = [];
  if (body.system) {
    const systemContent = Array.isArray(body.system)
      ? body.system.map((block) => {
          if (typeof block === "string") return block;
          if (block && typeof block === "object" && "text" in block) {
            return (block as { text: string }).text;
          }
          return "";
        }).join("\n")
      : body.system;
    messages.push({ role: "system", content: systemContent });
  }

  for (const message of body.messages) {
    let content = normalizeBlocks(message.content, triggerSignal);
    
    // 如果是用户消息且思考模式已启用，在消息末尾添加思考提示符
    if (message.role === "user" && body.thinking && body.thinking.type === "enabled") {
      content = content + THINKING_HINT;
    }
    
    messages.push({
      role: mapRole(message.role),
      content: content,
    });
  }

  const model = config.upstreamModelOverride ?? body.model;

  return {
    model,
    stream: true,
    temperature: body.temperature ?? 0.2,
    top_p: body.top_p ?? 1,
    max_tokens: body.max_tokens,
    messages,
  };
}
