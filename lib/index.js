// dsh-minimal-ptc 宿主行：把内置的 ptc-minimal 预设物化到用户预设根目录。
//
// 预设发现是实时重读的，因此安装完成后重启一次 web profile 进程，
// 选择器里就会出现「极简 PTC 模式」。
//
// 物化策略：目标目录不存在 → 写入全部文件并留版本标记；
// 版本标记低于当前版本 → 用插件自带文件刷新；
// 目录存在但无标记（视为用户自建）→ 不覆盖。
//
// 零运行时依赖：harness home 的解析逻辑内置（DSH_HOME 环境变量优先，
// 否则 ~/.dsh），与 dsh 官方规则一致。
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'ptc-minimal-preset'

const VERSION = '0.4.1'
const PRESET_ID = 'ptc-minimal'
const MARKER = '.dsh-ptc-minimal.version'

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const presetSourceDir = join(packageDir, 'presets', PRESET_ID)

/** 与 @deepseek-ai/dsh-home-paths 相同的解析规则：DSH_HOME > ~/.dsh。 */
function dshHomePath(...segments) {
  const env = process.env.DSH_HOME
  const fromEnv = typeof env === 'string' && env.trim().length > 0 ? env : null
  let base = fromEnv ?? join(homedir(), '.dsh')
  if (base === '~') base = homedir()
  if (base.startsWith('~/') || base.startsWith('~\\')) base = join(homedir(), base.slice(2))
  return resolve(base, ...segments)
}

function materialize(logger) {
  const dir = dshHomePath('.agent-presets', PRESET_ID)
  mkdirSync(dir, { recursive: true })

  let marker = null
  try {
    marker = readFileSync(join(dir, MARKER), 'utf8').trim()
  } catch {
    // 无标记：可能是首次安装，也可能是用户自建目录
  }

  if (marker === VERSION) return
  if (marker === null && existsSync(join(dir, 'agent.cordis.yml'))) {
    logger?.warn(`dsh-minimal-ptc: ${dir} exists without our marker; leaving it alone`)
    return
  }

  for (const file of ['agent.cordis.yml', 'preset.yml', 'gitbash-executor.mjs']) {
    writeFileSync(join(dir, file), readFileSync(join(presetSourceDir, file)))
  }
  writeFileSync(join(dir, MARKER), VERSION + '\n')
  logger?.info(`dsh-minimal-ptc: materialized agent preset "${PRESET_ID}" into ${dir}`)
}

export function apply(ctx) {
  try {
    materialize(ctx.logger)
  } catch (error) {
    ctx.logger?.warn(`dsh-minimal-ptc: preset materialization failed: ${String(error)}`)
  }
}
