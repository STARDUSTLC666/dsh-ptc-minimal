# dsh-ptc-minimal

> 极简提示词 × PTC 全能力 —— 一个更"干净"的编码 Agent。
> 安装即获得新的 Agent 模式：**极简 PTC 模式**；Windows 自动启用 Git Bash，bash 工具与 RL 训练分布对齐。

## 卖点

- **对齐 RL 训练**：系统提示词只有一句 `You are a helpful software engineer assistant.`，
  贴近 RL 微调时的简洁指令分布，没有长提示词带来的格式偏置与上下文噪音，
  让模型按训练时的节奏干活。
- **工具完整**：完整继承 PTC 模式的全部工具 —— Code Mode SDK 多步编排、
  文件读写与检索、Shell、Skills、计划、目标、子代理、工作流，一个不少。
- **灰测级别思维链**：Code Mode SDK 把"想"和"做"装进一个 TypeScript 程序：
  多步操作先编排、再一次执行，等于内置了灰测通道的思维链，还不占额外回合。
- **Windows 保持 bash**：预设内置 Git Bash executor（自动探测 GIT_BASH → Program Files\Git → LOCALAPPDATA\Git → PATH），`bash` 工具不再在 Windows 上被禁用；pwsh 仍保留为备用。

## 安装

1. 把本包加入 web profile（`package.json`）：

   ```json
   "dependencies": { "dsh-ptc-minimal": "^0.2.0" },
   "dsh": { "profile": { "bundles": [..., "dsh-ptc-minimal"] } }
   ```

   本地开发也可以用 link：`"dsh-ptc-minimal": "link:E://deepseek//dsh-ptc-minimal"`。

2. 在 profile 目录执行 `pnpm install`。

3. 重启 web profile 进程：宿主行会把内置预设物化到
   `$DSH_HOME/.agent-presets/ptc-minimal`。

4. 新建会话时选择 **极简 PTC 模式**。

## 目录结构

```
dsh-ptc-minimal/
├── cordis.patch.yml              # 插入宿主行（物化预设）
├── lib/index.js                  # 宿主插件：物化 ptc-minimal 预设到用户预设根目录
└── presets/ptc-minimal/          # 内置 Agent 模式（极简提示词 + PTC 全能力）
    ├── agent.cordis.yml
    ├── gitbash-executor.mjs      # Windows Git Bash 探测与执行器（零依赖）
    └── preset.yml
```

## 说明

- 物化策略：目标目录不存在 → 写入全部文件并留版本标记；版本标记低于当前
  版本 → 刷新；目录存在但无标记（用户自建）→ 不覆盖。
- 升级插件：改 `version` 并同步 `lib/index.js` 里的 `VERSION` 常量即可刷新
  用户根目录里的预设文件。

## 许可证

MIT
