import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const plugin = await import('../lib/index.js')

test('plugin exposes the preset materializer shape', () => {
  assert.equal(plugin.name, 'ptc-minimal-preset')
  assert.equal(typeof plugin.apply, 'function')
})

test('ships a ptc-minimal preset composition', () => {
  const composition = readFileSync(new URL('../presets/ptc-minimal/agent.cordis.yml', import.meta.url), 'utf8')
  const metadata = readFileSync(new URL('../presets/ptc-minimal/preset.yml', import.meta.url), 'utf8')
  assert.match(composition, /id: persona/)
  assert.match(composition, /id: tool-presentation/)
  assert.match(composition, /You are a helpful software engineer assistant/)
  assert.match(metadata, /name: 极简 PTC 模式/)
})
