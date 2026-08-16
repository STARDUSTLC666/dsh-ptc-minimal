# dsh-ptc-minimal

> Minimal prompt x full PTC capabilities — a cleaner coding agent.
> Installing gives you a new agent mode: **Minimal PTC**, with Git Bash kept alive on Windows so the bash tool matches the RL training distribution.

## Highlights

- **RL-aligned**: the whole system prompt is one sentence — `You are a helpful software engineer assistant.` — close to the compact instruction distribution used during RL fine-tuning, without long-prompt format bias or context noise.
- **Complete toolset**: inherits the full PTC toolset — Code Mode SDK multi-step orchestration, files and search, Shell, Skills, plan mode, goals, subagents, and workflows.
- **Gray-box reasoning**: the Code Mode SDK packs thinking and acting into one TypeScript program: multi-step work is orchestrated first, then executed once — a built-in chain-of-thought channel without extra turns.
- **Git Bash on Windows**: ships a preset-local Git Bash executor (GIT_BASH -> Program Files\Git -> LOCALAPPDATA\Git -> PATH). The bash tool is no longer disabled on Windows; pwsh remains available as a fallback.

## Installation

1. Add this package to a web profile (`package.json`):

   ```json
   "dependencies": { "dsh-ptc-minimal": "^0.2.0" },
   "dsh": { "profile": { "bundles": [..., "dsh-ptc-minimal"] } }
   ```

   Local development can use a link: `"dsh-ptc-minimal": "link:E://deepseek//dsh-ptc-minimal"`.

2. Run `pnpm install` in the profile directory.

3. Restart the web profile process. The host row materializes the bundled preset into `$DSH_HOME/.agent-presets/ptc-minimal`.

4. Select **Minimal PTC** when starting a new session.

## Capabilities

- Web search is enabled via `tool-web`; arbitrary page fetch is disabled by default (`fetch: false`).
- Subagents are enabled: `subagent`, `subagent_fork`, `subagent_control`, workflows, and Ralph.
- `subagent_codex` and `subagent_claude_code` providers are disabled by default; remove their `disabled: true` lines to expose them.

## Materialization policy

- No target directory -> write all preset files and a version marker.
- Marker version lower than the plugin version -> refresh from the bundled files.
- Directory exists without a marker (treated as user-created) -> leave it untouched.
- Upgrading: bump `version` in `package.json` and the `VERSION` constant in `lib/index.js`.

## License

MIT
