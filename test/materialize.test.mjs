import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../lib/index.js'
import pkg from '../package.json' with { type: 'json' }

test('materialization honors version marker and user-created directories', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-ptc-materialize-'))
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  const preset = join(dir, '.agent-presets', 'ptc-minimal')
  const marker = join(preset, '.dsh-ptc-minimal.version')
  try {
    apply({})
    assert.equal(readFileSync(marker, 'utf8').trim(), pkg.version)
    assert.ok(existsSync(join(preset, 'agent.cordis.yml')))

    // Same version: user edits in the materialized copy are preserved.
    writeFileSync(join(preset, 'agent.cordis.yml'), '# user edit')
    apply({})
    assert.equal(readFileSync(join(preset, 'agent.cordis.yml'), 'utf8'), '# user edit')

    // User-created directory without marker is never overwritten.
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(preset, { recursive: true })
    writeFileSync(join(preset, 'agent.cordis.yml'), '# user-created preset')
    apply({})
    assert.equal(readFileSync(join(preset, 'agent.cordis.yml'), 'utf8'), '# user-created preset')
    assert.equal(existsSync(marker), false)

    // Older marker refreshes from the bundled files.
    rmSync(dir, { recursive: true, force: true })
    apply({})
    writeFileSync(marker, '0.0.1\n')
    writeFileSync(join(preset, 'agent.cordis.yml'), '# stale copy')
    apply({})
    assert.equal(readFileSync(marker, 'utf8').trim(), pkg.version)
    assert.notEqual(readFileSync(join(preset, 'agent.cordis.yml'), 'utf8'), '# stale copy')
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previous
    rmSync(dir, { recursive: true, force: true })
  }
})
