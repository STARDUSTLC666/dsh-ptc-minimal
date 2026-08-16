# dsh-minimal-ptc

> Minimal prompt x full PTC capabilities — a cleaner coding agent.
> Installing gives you a new agent mode: **Minimal PTC**, with Git Bash kept alive on Windows so the bash tool matches the RL training distribution.

## Highlights

- **RL-aligned**: the whole system prompt is one sentence — `You are a helpful software engineer assistant.` — close to the compact instruction distribution used during RL fine-tuning, without long-prompt format bias or context noise.
- **Complete toolset**: inherits the full PTC toolset — Code Mode SDK multi-step orchestration, files and search, Shell, Skills, plan mode, goals, subagents, and workflows.
- **We / Let's reasoning**: the Code Mode SDK packs thinking and doing into one TypeScript program, orchestrating multi-step operations before executing them once. This matches the high-scoring Minimal trajectory in DeepSeek's official Project2 V4.1b runs (99/96), where reasoning is dominated by `we` / `let's` instead of the standard-like `let me` / `I` blocks seen at 91/92.
- **Git Bash on Windows**: ships a preset-local Git Bash executor (GIT_BASH -> Program Files\Git -> LOCALAPPDATA\Git -> PATH). The bash tool is no longer disabled on Windows; pwsh remains available as a fallback.

## Installation

1. Add this package to a web profile (`package.json`):

   ```json
   "dependencies": { "dsh-minimal-ptc": "^0.4.0" },
   "dsh": { "profile": { "bundles": [..., "dsh-minimal-ptc"] } }
   ```

   Local development can use a link: `"dsh-minimal-ptc": "link:E://deepseek//dsh-minimal-ptc"`.

2. Run `pnpm install` in the profile directory.

3. Restart the web profile process. The host row materializes the bundled preset into `$DSH_HOME/.agent-presets/ptc-minimal`.

4. Select **Minimal PTC** when starting a new session.

## Capabilities

- Web search is enabled via `tool-web`; arbitrary page fetch is disabled by default (`fetch: false`).
- Subagents are enabled: `subagent`, `subagent_fork`, `subagent_control`, workflows, and Ralph.
- `subagent_codex` and `subagent_claude_code` providers are disabled by default; remove their `disabled: true` lines to expose them.

## Windows Git Bash configuration

The preset-local Git Bash executor can be overridden in `agent.cordis.yml` under `gitbash-executor`:

| Option | Default | Meaning |
| :-- | :-- | :-- |
| `shellPath` | auto-detected | Fixed Git Bash path (e.g. `C:\\Program Files\\Git\\bin\\bash.exe`) |
| `timeoutMs` | 120000 | Per-command timeout (ms) |
| `maxTimeoutMs` | 600000 | Maximum timeout a request may ask for |
| `maxOutputBytes` | 64000 | Per-call output cap |
| `maxSpillBytes` | 67108864 | Output spill-to-disk cap |
| `graceMs` | 3000 | Grace period after timeout |

Detection order: `GIT_BASH` -> `Program Files\\Git` -> `Program Files (x86)\\Git` -> `LOCALAPPDATA\\Programs\\Git` -> PATH.

## Materialization policy

- No target directory -> write all preset files and a version marker.
- Marker version lower than the plugin version -> refresh from the bundled files.
- Directory exists without a marker (treated as user-created) -> leave it untouched.
- Upgrading: bump `version` in `package.json` and the `VERSION` constant in `lib/index.js`.

## License

MIT
