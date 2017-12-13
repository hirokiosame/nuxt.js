import sinon from 'sinon'

let context = null

export function release() {
  if (context === null) {
    process.stderr.write('Console spy context was empty, did a previous test already release it?\n')
    return
  }

  if (context.log) {
    console.log = context.log // eslint-disable-line no-console
  }
  if (context.info) {
    console.info = context.info // eslint-disable-line no-console
  }
  if (context.warn) {
    console.warn = context.warn // eslint-disable-line no-console
  }
  if (context.error) {
    console.error = context.error // eslint-disable-line no-console
  }

  context = null
}

export async function intercept(levels, msg, cb) {
  if (context !== null) {
    process.stderr.write('Console spy context was not empty, did a previous test not release it?\n')
  }
  context = {}

  if (cb === undefined && typeof msg === 'function') {
    cb = msg
    msg = undefined

    if (typeof levels === 'string') {
      msg = levels
      levels = undefined
    }
  }

  if (cb === undefined && msg === undefined && typeof levels === 'function') {
    cb = levels
    levels = undefined
  }

  const all = levels === undefined || levels === {}
  const spies = {}

  if (all || levels.log) {
    context.log = console.log // eslint-disable-line no-console
    spies.log = console.log = sinon.spy() // eslint-disable-line no-console
  }

  if (all || levels.info) {
    context.info = console.info // eslint-disable-line no-console
    spies.info = console.info = sinon.spy() // eslint-disable-line no-console
  }

  if (all || levels.warn) {
    context.warn = console.warn // eslint-disable-line no-console
    spies.warn = console.warn = sinon.spy() // eslint-disable-line no-console
  }

  if (all || levels.error) {
    context.error = console.error // eslint-disable-line no-console
    spies.error = console.error = sinon.spy() // eslint-disable-line no-console
  }

  if (cb) {
    if (msg) {
      process.stdout.write(`  ${msg}`)
    }

    await cb()

    if (msg) {
      process.stdout.write('\n')
    }

    release()
  }

  return spies
}

export async function interceptLog(msg, cb) {
  const { log } = await intercept({ log: true }, msg, cb)
  return log
}

export async function interceptInfo(msg, cb) {
  const { info } = await intercept({ info: true }, msg, cb)
  return info
}

export async function interceptWarn(msg, cb) {
  const { warn } = await intercept({ warn: true }, msg, cb)
  return warn
}

export async function interceptError(msg, cb) {
  const { error } = await intercept({ error: true }, msg, cb)
  return error
}
