import test from 'node:test'
import assert from 'node:assert/strict'
import { apply, detectShellPath, resolveConfig, toWindowsPath } from '../presets/ptc-minimal/gitbash-executor.mjs'

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

test('detectShellPath honors GIT_BASH env on win32', { skip: !win }, () => {
  const env = { GIT_BASH: process.execPath }
  assert.equal(detectShellPath(undefined, env), process.execPath)
})

test('detectShellPath on POSIX returns bash regardless of GIT_BASH', { skip: win }, () => {
  assert.equal(detectShellPath(undefined, { GIT_BASH: process.execPath }), 'bash')
})

test('resolveConfig defaults', () => {
  const resolved = resolveConfig({}, {})
  assert.equal(resolved.timeoutMs, 120000)
  assert.equal(resolved.maxTimeoutMs, 600000)
  assert.equal(resolved.maxOutputBytes, 64000)
  assert.equal(resolved.graceMs, 3000)
  assert.equal(typeof resolved.shellPath, 'string')
})

test('start() applies the request timeout to background shells', async () => {
  let capturedSignal
  let providedShell
  const fakeHandle = {
    done: new Promise(() => {}),
    collected: {
      stdout: { readFrom: () => ({ text: '', nextOffset: 0, lossy: false }) },
      stderr: { readFrom: () => ({ text: '', nextOffset: 0, lossy: false }) },
    },
    terminate: () => {},
  }
  const ctx = {
    get(name) {
      if (name === 'subprocess') return { spawn: (spec) => { capturedSignal = spec.signal; return fakeHandle } }
      if (name === 'sandboxPolicy') return { defaultMode: 'danger-full-access', resolve: () => ({ mode: 'danger-full-access' }) }
      return undefined
    },
    provide(_name, shell) { providedShell = shell },
  }
  apply(ctx, { shellPath: process.execPath, timeoutMs: 30, maxTimeoutMs: 30, graceMs: 10 })
  const proc = providedShell.start(providedShell.resolve({ command: 'sleep 10' }))
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 80))
  assert.equal(capturedSignal.aborted, true)
  proc.kill()
})

test('resolveConfig rejects invalid timer values', () => {
  assert.throws(() => resolveConfig({ timeoutMs: 0 }, {}), /positive/)
  assert.throws(() => resolveConfig({ maxTimeoutMs: 999999999999 }, {}), /no greater than/)
})
