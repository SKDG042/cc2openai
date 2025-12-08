# 日志配置

本文档描述了如何配置 deno-proxy 的日志系统。

## 环境变量

### LOG_LEVEL

控制日志的详细程度。可选值：

- `debug` - 显示所有日志（最详细）
- `info` - 显示信息、警告和错误日志（默认）
- `warn` - 显示警告和错误日志
- `error` - 仅显示错误日志

示例：
```bash
LOG_LEVEL=debug deno run --allow-env --allow-net --allow-read --allow-write src/main.ts
```

### LOGGING_DISABLED

完全禁用日志输出。当设置为 `true` 或 `1` 时，所有日志将被禁用。

可选值：
- `true` - 禁用所有日志
- `1` - 禁用所有日志
- 其他值或不设置 - 启用日志

示例：
```bash
# 完全禁用日志
LOGGING_DISABLED=true deno run --allow-env --allow-net --allow-read --allow-write src/main.ts

# 或者使用 1
LOGGING_DISABLED=1 deno run --allow-env --allow-net --allow-read --allow-write src/main.ts
```

## 组合使用

你可以组合使用这些环境变量：

```bash
# 设置日志级别为警告级别，但不完全禁用日志
LOG_LEVEL=warn deno run --allow-env --allow-net --allow-read --allow-write src/main.ts

# 完全禁用日志（LOGGING_DISABLED 优先级更高）
LOG_LEVEL=debug LOGGING_DISABLED=true deno run --allow-env --allow-net --allow-read --allow-write src/main.ts
```

## 注意事项

1. 当 `LOGGING_DISABLED` 设置为 `true` 或 `1` 时，它将覆盖 `LOG_LEVEL` 设置，完全禁用所有日志输出。
2. 即使禁用了日志，错误仍会正常抛出，只是不会记录到日志文件或控制台。
3. 禁用日志可能会略微提高性能，特别是在高并发场景下。

## 测试日志配置

使用提供的测试脚本来验证日志配置：

```bash
./scripts/test-logging-disabled.sh
```

这个脚本会测试两种情况：
1. 不设置 `LOGGING_DISABLED`（应该有日志输出）
2. 设置 `LOGGING_DISABLED=true`（应该没有日志输出）