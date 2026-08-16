import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const plugin = await import('../lib/index.js')

test('plugin exposes the preset materializer shape', () => {
  assert.equal(plugin.name, 'ptc-minimal-preset')
  assert.equal(typeof plugin.apply, 'function')
})

test('materializes all preset files including the git-bash executor', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-minimal-ptc-home-'))
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  try {
    plugin.apply({})
    const preset = join(dir, '.agent-presets', 'ptc-minimal')
    assert.ok(existsSync(join(preset, 'agent.cordis.yml')))
    assert.ok(existsSync(join(preset, 'preset.yml')))
    assert.ok(existsSync(join(preset, 'gitbash-executor.mjs')), 'Windows Git Bash executor must be materialized with the preset')
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previous
    rmSync(dir, { recursive: true, force: true })
  }
})

test('ships a ptc-minimal preset composition', () => {
  const composition = readFileSync(new URL('../presets/ptc-minimal/agent.cordis.yml', import.meta.url), 'utf8')
  const metadata = readFileSync(new URL('../presets/ptc-minimal/preset.yml', import.meta.url), 'utf8')
  assert.match(composition, /id: persona/)
  assert.match(composition, /id: tool-presentation/)
  assert.match(composition, /You are a helpful software engineer assistant/)
  assert.match(metadata, /name: 极简 PTC 模式/)
})
