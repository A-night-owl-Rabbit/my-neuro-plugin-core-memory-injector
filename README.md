# 核心记忆注入插件

将 `核心用户记忆.txt` 的内容持续注入到 AI 系统提示词中的 [my-neuro](https://github.com/morettt/my-neuro) 插件。

## 功能

- **每次请求注入**：通过 `onLLMRequest` 钩子，在每次 LLM 调用前将核心记忆注入到系统提示词
- **文件变更监听**：核心记忆文件被修改时自动重新加载（1 秒防抖）
- **压缩安全**：注入发生在 API 调用的深拷贝消息中，不影响持久化消息，不会被上下文压缩器移除
- **多插件兼容**：不使用 `addSystemPromptPatch`，避免与其他插件互相覆盖
- **零配置**：无需额外配置，放置即用

## 安装

将整个目录复制到 `live-2d/plugins/community/core-memory-injector/`：

```
live-2d/plugins/community/core-memory-injector/
├── metadata.json
├── index.js
└── README.md
```

然后在 `live-2d/plugins/enabled_plugins.json` 的 `plugins` 数组中添加：

```json
"community/core-memory-injector"
```

## 工作原理

插件在启动时读取 `核心用户记忆.txt` 并缓存到内存。每次 LLM 请求触发 `onLLMRequest` 钩子时，将缓存的记忆内容追加到系统提示词末尾。

由于 `onLLMRequest` 操作的是 `llm-handler.js` 中 `JSON.parse(JSON.stringify(...))` 生成的深拷贝消息，注入不会影响持久化的对话历史，上下文压缩器也无法触及。

## 核心记忆文件

插件读取的文件路径为：`live-2d/AI记录室/核心用户记忆.txt`

该文件通常包含：
- 用户画像（姓名、年龄、性格、爱好等）
- AI 的约定与规则
- 工具使用偏好
- AI 日志与月度总结

你可以手动编辑该文件，插件会自动检测变更并重新加载。

## 许可

MIT
