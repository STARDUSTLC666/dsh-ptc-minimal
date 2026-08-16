import test from 'node:test'
import assert from 'node:assert/strict'
import { detectShellPath, resolveConfig, toWindowsPath } from '../presets/ptc-minimal/gitbash-executor.mjs'

const win = process.platform === 'win32'

test('toWindowsPath converts MSYS drive paths on win32', { skip: !win }, () => {
  assert.equal(toWindowsPath('/d/foo'), 'D:\\foo')
  assert.equal(toWindowsPath('/d'), 'D:\\')
  assert.equal(toWindowsPath('/D/Foo'), 'D:\\Foo')
  assert.equal(toWindowsPath('/usr/bin'), '/usr/bin')
  assert.equal(toWindowsPath('D:\\foo'), 'D:\\foo')
})

test('detectShellPath explicit config wins', () => {
  const explicit = win ? 'C:\\Custom\\Git\\bin\\bash.exe' : '/opt/bin/bash'
  assert.equal(detectShellPath(explicit, {}), explicit)
})

test('detectShellPath honors GIT_BASH env', () => {
  const env = { GIT_BASH: process.execPath }
  assert.equal(detectShellPath(undefined, env), process.execPath)
})

test('resolveConfig defaults', () => {
  const resolved = resolveConfig({}, {})
  assert.equal(resolved.timeoutMs, 120000)
  assert.equal(resolved.maxTimeoutMs, 600000)
  assert.equal(resolved.maxOutputBytes, 64000)
  assert.equal(resolved.graceMs, 3000)
  assert.equal(typeof resolved.shellPath, 'string')
})

test('resolveConfig rejects invalid timer values', () => {
  assert.throws(() => resolveConfig({ timeoutMs: 0 }, {}), /positive/)
  assert.throws(() => resolveConfig({ maxTimeoutMs: 999999999999 }, {}), /no greater than/)
})
