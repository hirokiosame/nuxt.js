import test from 'ava'
import { resolve } from 'path'
import rp from 'request-promise-native'
import { Nuxt, Builder } from '..'

const port = 4009
const url = (route) => 'http://localhost:' + port + route

let nuxt = null

// Init nuxt.js and create server listening on localhost:4000
test.before('Init Nuxt.js', async t => {
  const rootDir = resolve(__dirname, 'fixtures/debug')
  let config = require(resolve(rootDir, 'nuxt.config.js'))
  config.rootDir = rootDir
  config.dev = true // Needed for _open middleware
  nuxt = new Nuxt(config)
  await new Builder(nuxt).build()

  await nuxt.listen(port, 'localhost')
})

test('/test/_open (open-in-editor)', async t => {
  const { body } = await rp(url('/test/_open?file=pages/index.vue'), { resolveWithFullResponse: true })
  t.is(body, 'opened in editor!')
})

test('/test/_open should return error (open-in-editor)', async t => {
  const { body } = await rp(url('/test/_open?file='), { resolveWithFullResponse: true })
  t.is(body, 'File is not specified')
})

test('/test/error should return error stack trace (Youch)', async t => {
  const { response, error } = await t.throws(nuxt.renderAndGetWindow(url('/test/error')))
  t.is(response.statusCode, 500)
  t.is(response.statusMessage, 'NuxtServerError')
  t.true(error.includes('test youch !'))
  t.true(error.includes('<div class="error-frames">'))
})

test('/test/error no source-map (Youch)', async t => {
  const sourceMaps = nuxt.renderer.resources.serverBundle.maps
  nuxt.renderer.resources.serverBundle.maps = {}

  const { response, error } = await t.throws(nuxt.renderAndGetWindow(url('/test/error')))
  t.is(response.statusCode, 500)
  t.is(response.statusMessage, 'NuxtServerError')
  t.true(error.includes('test youch !'))
  t.true(error.includes('<div class="error-frames">'))

  nuxt.renderer.resources.serverBundle.maps = sourceMaps
})

test('/test/error should return json format error (Youch)', async t => {
  const opts = {
    headers: {
      'accept': 'application/json'
    },
    resolveWithFullResponse: true
  }
  const { response: { headers } } = await t.throws(rp(url('/test/error'), opts))
  t.is(headers['content-type'], 'text/json; charset=utf-8')
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', t => {
  nuxt.close()
})
