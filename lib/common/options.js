const _ = require('lodash')
const Debug = require('debug')
const { join, resolve } = require('path')
const { existsSync } = require('fs')
const { isUrl, isPureObject } = require('../common/utils')

const debug = Debug('nuxt:build')
debug.color = 2 // Force green color

const Options = {}

module.exports = Options

Options.from = function (_options) {
  // Clone options to prevent unwanted side-effects
  const options = Object.assign({}, _options)

  // Normalize options
  if (options.loading === true) {
    delete options.loading
  }
  if (options.router && options.router.middleware && !Array.isArray(options.router.middleware)) {
    options.router.middleware = [options.router.middleware]
  }
  if (options.router && typeof options.router.base === 'string') {
    options._routerBaseSpecified = true
  }
  if (typeof options.transition === 'string') {
    options.transition = { name: options.transition }
  }
  if (typeof options.layoutTransition === 'string') {
    options.layoutTransition = { name: options.layoutTransition }
  }

  const hasValue = v => typeof v === 'string' && v
  options.rootDir = hasValue(options.rootDir) ? options.rootDir : process.cwd()

  // Apply defaults by ${buildDir}/dist/build.config.js
  const buildDir = options.buildDir || Options.defaults.buildDir
  const buildConfig = resolve(options.rootDir, buildDir, 'build.config.js')
  if (existsSync(buildConfig)) {
    _.defaultsDeep(options, require(buildConfig))
  }
  // Apply defaults
  _.defaultsDeep(options, Options.defaults)

  // Resolve dirs
  options.srcDir = hasValue(options.srcDir) ? resolve(options.rootDir, options.srcDir) : options.rootDir
  options.buildDir = resolve(options.rootDir, options.buildDir)
  options.cacheDir = resolve(options.rootDir, options.cacheDir)

  // Populate modulesDir
  options.modulesDir = []
    .concat(options.modulesDir, join(options.nuxtDir, 'node_modules'))
    .filter(dir => hasValue(dir))
    .map(dir => resolve(options.rootDir, dir))

  // If app.html is defined, set the template path to the user template
  options.appTemplatePath = resolve(options.buildDir, 'views/app.template.html')
  if (existsSync(join(options.srcDir, 'app.html'))) {
    options.appTemplatePath = join(options.srcDir, 'app.html')
  }

  // Ignore publicPath on dev
  /* istanbul ignore if */
  if (options.dev && isUrl(options.build.publicPath)) {
    options.build.publicPath = Options.defaults.build.publicPath
  }

  // If store defined, update store options to true unless explicitly disabled
  if (options.store !== false && existsSync(join(options.srcDir, 'store'))) {
    options.store = true
  }

  // Normalize loadingIndicator
  if (!isPureObject(options.loadingIndicator)) {
    options.loadingIndicator = { name: options.loadingIndicator }
  }

  // Apply defaults to loadingIndicator
  options.loadingIndicator = Object.assign({
    name: 'pulse',
    color: '#dbe1ec',
    background: 'white'
  }, options.loadingIndicator)

  // cssSourceMap
  if (options.build.cssSourceMap === undefined) {
    options.build.cssSourceMap = options.dev
  }

  // Postcss
  // 1. Check if it is explicitly disabled by false value
  // ... Disable all postcss loaders
  // 2. Check if any standard source of postcss config exists
  // ... Make postcss = { config: { path } }
  // 3. Else (Easy Usage)
  // ... Auto merge it with defaults
  if (options.build.postcss !== false) {
    // Detect postcss config existence
    // https://github.com/michael-ciniawsky/postcss-load-config
    let postcssConfigPath
    for (let dir of [options.srcDir, options.rootDir]) {
      for (let file of ['postcss.config.js', '.postcssrc.js', '.postcssrc', '.postcssrc.json', '.postcssrc.yaml']) {
        if (existsSync(resolve(dir, file))) {
          postcssConfigPath = resolve(dir, file)
          break
        }
      }
      if (postcssConfigPath) break
    }

    // Default postcss options
    if (postcssConfigPath) {
      debug(`Using PostCSS config file: ${postcssConfigPath}`)
      options.build.postcss = {
        sourceMap: options.build.cssSourceMap,
        // https://github.com/postcss/postcss-loader/blob/master/lib/index.js#L79
        config: {
          path: postcssConfigPath
        }
      }
    } else {
      if (Object.keys(options.build.postcss).length) {
        debug('Using PostCSS config from `build.postcss`')
      }
      // Normalize & Apply default plugins
      if (Array.isArray(options.build.postcss)) {
        options.build.postcss = { plugins: options.build.postcss }
      }
      if (isPureObject(options.build.postcss)) {
        options.build.postcss = Object.assign({
          sourceMap: options.build.cssSourceMap,
          plugins: {
            // https://github.com/postcss/postcss-import
            'postcss-import': {
              root: options.rootDir,
              path: [
                options.srcDir,
                options.rootDir,
                ...options.modulesDir
              ]
            },
            // https://github.com/postcss/postcss-url
            'postcss-url': {},
            // http://cssnext.io/postcss
            'postcss-cssnext': {}
          }
        }, options.build.postcss)
      }
    }
  }

  // Debug errors
  if (options.debug === undefined) {
    options.debug = options.dev
  }

  // Apply mode preset
  let modePreset = Options.modes[options.mode || 'universal'] || Options.modes['universal']
  _.defaultsDeep(options, modePreset)

  // If no server-side rendering, add appear true transition
  /* istanbul ignore if */
  if (options.render.ssr === false && options.transition) {
    options.transition.appear = true
  }

  return options
}

Options.modes = {
  universal: {
    build: {
      ssr: true
    },
    render: {
      ssr: true
    }
  },
  spa: {
    build: {
      ssr: false
    },
    render: {
      ssr: false
    }
  }
}

Options.unsafeKeys = [
  'rootDir', 'srcDir', 'buildDir', 'modulesDir', 'cacheDir', 'nuxtDir',
  'nuxtAppDir', 'build', 'generate', 'router.routes', 'appTemplatePath'
]

Options.defaults = {
  mode: 'universal',
  dev: process.env.NODE_ENV !== 'production',
  debug: undefined, // Will be equal to dev if not provided
  buildDir: '.nuxt',
  cacheDir: '.cache',
  nuxtDir: resolve(__dirname, '../..'),
  nuxtAppDir: resolve(__dirname, '../app'),
  modulesDir: ['node_modules'], // ~> relative to options.rootDir
  build: {
    analyze: false,
    profile: process.argv.includes('--profile'),
    dll: false,
    scopeHoisting: false,
    extractCSS: false,
    cssSourceMap: undefined,
    ssr: undefined,
    uglify: {},
    publicPath: '/_nuxt/',
    filenames: {
      css: 'vendor.[contenthash].css',
      manifest: 'manifest.[hash].js',
      vendor: 'vendor.[chunkhash].js',
      app: 'app.[chunkhash].js',
      chunk: '[name].[chunkhash].js'
    },
    vendor: [],
    plugins: [],
    babel: {},
    postcss: {},
    templates: [],
    watch: [],
    devMiddleware: {},
    hotMiddleware: {}
  },
  generate: {
    dir: 'dist',
    routes: [],
    concurrency: 500,
    interval: 0,
    subFolders: true,
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: false,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      processConditionalComments: true,
      removeAttributeQuotes: false,
      removeComments: false,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: false,
      removeStyleLinkTypeAttributes: false,
      removeTagWhitespace: false,
      sortAttributes: true,
      sortClassName: false,
      trimCustomFragments: true,
      useShortDoctype: true
    }
  },
  env: {},
  head: {
    meta: [],
    link: [],
    style: [],
    script: []
  },
  plugins: [],
  css: [],
  modules: [],
  layouts: {},
  serverMiddleware: [],
  ErrorPage: null,
  loading: {
    color: 'black',
    failedColor: 'red',
    height: '2px',
    duration: 5000,
    rtl: false
  },
  loadingIndicator: {},
  transition: {
    name: 'page',
    mode: 'out-in',
    appear: false,
    appearClass: 'appear',
    appearActiveClass: 'appear-active',
    appearToClass: 'appear-to'
  },
  layoutTransition: {
    name: 'layout',
    mode: 'out-in'
  },
  router: {
    mode: 'history',
    base: '/',
    routes: [],
    middleware: [],
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    extendRoutes: null,
    scrollBehavior: null,
    parseQuery: false,
    stringifyQuery: false,
    fallback: false
  },
  render: {
    bundleRenderer: {},
    resourceHints: true,
    ssr: undefined,
    http2: {
      push: false
    },
    static: {},
    gzip: {
      threshold: 0
    },
    etag: {
      weak: true // Faster for responses > 5KB
    }
  },
  watchers: {
    webpack: {
      ignored: /-dll/
    },
    chokidar: {}
  },
  editor: {
    editor: 'code'
  },
  hooks: null,
  messages: {
    error_404: 'This page could not be found',
    server_error: 'Server error',
    nuxtjs: 'Nuxt.js',
    back_to_home: 'Back to the home page',
    server_error_details: 'An error occurred in the application and your page could not be served. If you are the application owner, check your logs for details.',
    client_error: 'Error',
    client_error_details: 'An error occurred while rendering the page. Check developer tools console for details.',
    redirect: 'Redirecting to external page.'
  }
}
