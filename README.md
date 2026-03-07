# 核心记忆注入插件

将 `核心用户记忆.txt` 的内容持续注入到 AI 系统提示词中的 [my-neuro](https://github.com/MoeVoiceStudio/my-neuro) 插件。

## 功能

- **启动自动注入**：应用启动时自动读取 `AI记录室/核心用户记忆.txt`，注入到系统提示词
- **文件变更监听**：核心记忆文件被修改时自动重新注入（1 秒防抖）
- **压缩安全**：注入内容位于 system 消息中，不会被上下文压缩器移除
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

插件利用 my-neuro 插件系统提供的 `addSystemPromptPatch(id, text)` API，在 `onStart` 生命周期将核心记忆文件的全部内容追加到系统提示词末尾。

注入格式：

```
--- Plugin Injections ---
【核心用户记忆 - 请务必牢记以下内容】
（核心用户记忆.txt 的完整内容）
--- End Plugin Injections ---
```

由于内容注入在 `role: system` 的消息中，上下文压缩器只处理 `user/assistant` 消息，因此核心记忆不会被压缩清除。

## 核心记忆文件

插件读取的文件路径为：`live-2d/AI记录室/核心用户记忆.txt`

该文件通常包含：
- 用户画像（姓名、年龄、性格、爱好等）
- AI 的约定与规则
- 工具使用偏好
- AI 日志与月度总结

你可以手动编辑该文件，插件会自动检测变更并重新注入。

## 许可

MIT
