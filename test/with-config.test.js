import test from 'ava'
import { resolve } from 'path'
import rp from 'request-promise-native'
import { Nuxt, Builder } from '..'
import { interceptLog, release } from './helpers/console'

const port = 4007
const url = (route) => 'http://localhost:' + port + route

let nuxt = null
let builder = null

// Init nuxt.js and create server listening on localhost:4000
test.before('Init Nuxt.js', async t => {
  const rootDir = resolve(__dirname, 'fixtures/with-config')
  let config = require(resolve(rootDir, 'nuxt.config.js'))
  config.rootDir = rootDir
  config.dev = false
  nuxt = new Nuxt(config)
  builder = new Builder(nuxt)
  await interceptLog('building nuxt', async () => {
    await builder.build()
  })
  await nuxt.listen(port, 'localhost')
})

test('/', async t => {
  const logSpy = await interceptLog(async () => {
    const { html } = await nuxt.renderRoute('/')
    t.true(html.includes('<h1>I have custom configurations</h1>'))
  })
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
})

test('/ (global styles inlined)', async t => {
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('.global-css-selector'))
})

test('/ (preload fonts)', async t => {
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('<link rel="preload" href="/test/orion/fonts/roboto.7cf5d7c.woff2" as="font" type="font/woff2" crossorigin'))
})

test('/ (custom app.html)', async t => {
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('<p>Made by Nuxt.js team</p>'))
})

test('/ (custom build.publicPath)', async t => {
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('src="/test/orion/vendor.'))
})

test('/ (custom postcss.config.js)', async t => {
  const { html } = await nuxt.renderRoute('/')
  t.true(html.includes('::-webkit-input-placeholder'))
})

test('/test/ (router base)', async t => {
  const logSpy = await interceptLog(async () => {
    const window = await nuxt.renderAndGetWindow(url('/test/'))

    const html = window.document.body.innerHTML
    t.is(window.__NUXT__.layout, 'default')
    t.true(html.includes('<h1>Default layout</h1>'))
    t.true(html.includes('<h1>I have custom configurations</h1>'))
  })

  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
})

test('/test/about (custom layout)', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/about'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.is(window.__NUXT__.layout, 'custom')
  t.true(html.includes('<h1>Custom layout</h1>'))
  t.true(html.includes('<h1>About page</h1>'))
})

test('/test/desktop (custom layout in desktop folder)', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/desktop'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.is(window.__NUXT__.layout, 'desktop/default')
  t.true(html.includes('<h1>Default desktop layout</h1>'))
  t.true(html.includes('<h1>Desktop page</h1>'))
})

test('/test/mobile (custom layout in mobile folder)', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/mobile'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.is(window.__NUXT__.layout, 'mobile/default')
  t.true(html.includes('<h1>Default mobile layout</h1>'))
  t.true(html.includes('<h1>Mobile page</h1>'))
})

test('/test/env', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/env'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.true(html.includes('<h1>Custom env layout</h1>'))
  t.true(html.includes('"bool": true'))
  t.true(html.includes('"num": 23'))
  t.true(html.includes('"string": "Nuxt.js"'))
  t.true(html.includes('"bool": false'))
  t.true(html.includes('"string": "ok"'))
  t.true(html.includes('"num2": 8.23'))
  t.true(html.includes('"obj": {'))
})

test('/test/error', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/error'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.true(html.includes('Error page'))
})

test('/test/user-agent', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/user-agent'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.true(html.includes('<pre>Mozilla'))
})

test('/test/about-bis (added with extendRoutes)', async t => {
  const logSpy = await interceptLog()
  const window = await nuxt.renderAndGetWindow(url('/test/about-bis'))
  t.true(logSpy.calledOnce)
  t.is(logSpy.args[0][0], 'Test plugin!')
  release()

  const html = window.document.body.innerHTML
  t.true(html.includes('<h1>Custom layout</h1>'))
  t.true(html.includes('<h1>About page</h1>'))
})

test('Check stats.json generated by build.analyze', t => {
  const stats = require(resolve(__dirname, 'fixtures/with-config/.nuxt/dist/stats.json'))
  t.is(stats.assets.length, 35)
})

test('Check /test/test.txt with custom serve-static options', async t => {
  const { headers } = await rp(url('/test/test.txt'), { resolveWithFullResponse: true })
  t.is(headers['cache-control'], 'public, max-age=31536000')
})

test('Check /test.txt should return 404', async t => {
  const err = await t.throws(rp(url('/test.txt')))
  t.is(err.response.statusCode, 404)
})

test('Check build.styleResources for style-resources-loader', async t => {
  const loaders = builder.styleLoader('scss')
  const loader = loaders.find(l => l.loader === 'style-resources-loader')
  t.is(typeof loader, 'object')
  t.deepEqual(loader.options, {
    patterns: [
      '~/assets/pre-process.scss'
    ]
  })
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', async t => {
  await nuxt.close()
})
