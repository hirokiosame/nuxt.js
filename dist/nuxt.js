/*!
 * Nuxt.js v1.0.0-rc11
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var path__default = _interopDefault(path);
var _ = require('lodash');
var ___default = _interopDefault(_);
var Debug = _interopDefault(require('debug'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var hash = _interopDefault(require('hash-sum'));
var chalk = _interopDefault(require('chalk'));
var ansiHTML = _interopDefault(require('ansi-html'));
var serialize = _interopDefault(require('serialize-javascript'));
var generateETag = _interopDefault(require('etag'));
var fresh = _interopDefault(require('fresh'));
var serveStatic = _interopDefault(require('serve-static'));
var compression = _interopDefault(require('compression'));
var fs$1 = require('fs-extra');
var fs$1__default = _interopDefault(fs$1);
var VueServerRenderer = require('vue-server-renderer');
var VueServerRenderer__default = _interopDefault(VueServerRenderer);
var Youch = _interopDefault(require('@nuxtjs/youch'));
var sourceMap = require('source-map');
var connect = _interopDefault(require('connect'));
var Vue = _interopDefault(require('vue'));
var VueMeta = _interopDefault(require('vue-meta'));
var LRU = _interopDefault(require('lru-cache'));
var enableDestroy = _interopDefault(require('server-destroy'));
var Module = _interopDefault(require('module'));
var chokidar = _interopDefault(require('chokidar'));
var pify = _interopDefault(require('pify'));
var webpack = _interopDefault(require('webpack'));
var MFS = _interopDefault(require('memory-fs'));
var webpackDevMiddleware = _interopDefault(require('webpack-dev-middleware'));
var webpackHotMiddleware = _interopDefault(require('webpack-hot-middleware'));
var Glob = _interopDefault(require('glob'));
var VueSSRClientPlugin = _interopDefault(require('vue-server-renderer/client-plugin'));
var HTMLPlugin = _interopDefault(require('html-webpack-plugin'));
var FriendlyErrorsWebpackPlugin = _interopDefault(require('friendly-errors-webpack-plugin'));
var UglifyJSPlugin = _interopDefault(require('uglifyjs-webpack-plugin'));
var ProgressBarPlugin = _interopDefault(require('progress-bar-webpack-plugin'));
var webpackBundleAnalyzer = require('webpack-bundle-analyzer');
var ExtractTextPlugin = _interopDefault(require('extract-text-webpack-plugin'));
var VueSSRServerPlugin = _interopDefault(require('vue-server-renderer/server-plugin'));
var nodeExternals = _interopDefault(require('webpack-node-externals'));
var htmlMinifier = require('html-minifier');

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve$$1, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve$$1,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve$$1, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve$$1(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

function encodeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getContext(req, res) {
  return { req, res };
}

function setAnsiColors(ansiHTML$$1) {
  ansiHTML$$1.setColors({
    reset: ['efefef', 'a6004c'],
    darkgrey: '5a012b',
    yellow: 'ffab07',
    green: 'aeefba',
    magenta: 'ff84bf',
    blue: '3505a0',
    cyan: '56eaec',
    red: '4e053a'
  });
}

let waitFor = (() => {
  var _ref = asyncToGenerator(function* (ms) {
    return new Promise(function (resolve$$1) {
      setTimeout(resolve$$1, ms || 0);
    });
  });

  return function waitFor(_x) {
    return _ref.apply(this, arguments);
  };
})();

function urlJoin() {
  return [].slice.call(arguments).join('/').replace(/\/+/g, '/').replace(':/', '://');
}

function isUrl(url) {
  return url.indexOf('http') === 0 || url.indexOf('//') === 0;
}

function promisifyRoute(fn) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn);
  }
  // If routes is a function expecting a callback
  if (fn.length === 1) {
    return new Promise((resolve$$1, reject) => {
      fn(function (err, routeParams) {
        if (err) {
          reject(err);
        }
        resolve$$1(routeParams);
      });
    });
  }
  let promise = fn();
  if (!promise || !(promise instanceof Promise) && typeof promise.then !== 'function') {
    promise = Promise.resolve(promise);
  }
  return promise;
}

function sequence(tasks, fn) {
  return tasks.reduce((promise, task) => promise.then(() => fn(task)), Promise.resolve());
}

function parallel(tasks, fn) {
  return Promise.all(tasks.map(task => fn(task)));
}

function chainFn(base, fn) {
  /* istanbul ignore if */
  if (!(fn instanceof Function)) {
    return;
  }
  return function () {
    if (typeof base !== 'function') {
      return fn.apply(this, arguments);
    }
    let baseResult = base.apply(this, arguments);
    // Allow function to mutate the first argument instead of returning the result
    if (baseResult === undefined) {
      baseResult = arguments[0];
    }
    let fnResult = fn.call(this, baseResult, ...Array.prototype.slice.call(arguments, 1));
    // Return mutated argument if no result was returned
    if (fnResult === undefined) {
      return baseResult;
    }
    return fnResult;
  };
}

function isPureObject(o) {
  return !Array.isArray(o) && typeof o === 'object';
}

const isWindows = /^win/.test(process.platform);

function wp(p = '') {
  /* istanbul ignore if */
  if (isWindows) {
    return p.replace(/\\/g, '\\\\');
  }
  return p;
}

function wChunk(p = '') {
  /* istanbul ignore if */
  if (isWindows) {
    return p.replace(/\//g, '\\\\');
  }
  return p;
}

const reqSep = /\//g;
const sysSep = ___default.escapeRegExp(path.sep);
const normalize = string => string.replace(reqSep, sysSep);

function r() {
  let args = Array.prototype.slice.apply(arguments);
  let lastArg = ___default.last(args);

  if (lastArg.indexOf('@') !== -1 || lastArg.indexOf('~') !== -1) {
    return wp(lastArg);
  }

  return wp(path.resolve(...args.map(normalize)));
}

function relativeTo() {
  let args = Array.prototype.slice.apply(arguments);
  let dir = args.shift();

  // Resolve path
  let path$$1 = r(...args);

  // Check if path is an alias
  if (path$$1.indexOf('@') !== -1 || path$$1.indexOf('~') !== -1) {
    return path$$1;
  }

  // Make correct relative path
  let rp = path.relative(dir, path$$1);
  if (rp[0] !== '.') {
    rp = './' + rp;
  }
  return wp(rp);
}

function flatRoutes(router, path$$1 = '', routes = []) {
  router.forEach(r => {
    if (!(r.path.indexOf(':') !== -1) && !(r.path.indexOf('*') !== -1)) {
      /* istanbul ignore if */
      if (r.children) {
        flatRoutes(r.children, path$$1 + r.path + '/', routes);
      } else {
        routes.push((r.path === '' && path$$1[path$$1.length - 1] === '/' ? path$$1.slice(0, -1) : path$$1) + r.path);
      }
    }
  });
  return routes;
}

function cleanChildrenRoutes(routes, isChild = false) {
  let start = -1;
  let routesIndex = [];
  routes.forEach(route => {
    if (/-index$/.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      let res = route.name.split('-');
      let s = res.indexOf('index');
      start = start === -1 || s < start ? s : start;
      routesIndex.push(res);
    }
  });
  routes.forEach(route => {
    route.path = isChild ? route.path.replace('/', '') : route.path;
    if (route.path.indexOf('?') > -1) {
      let names = route.name.split('-');
      let paths = route.path.split('/');
      if (!isChild) {
        paths.shift();
      } // clean first / for parents
      routesIndex.forEach(r => {
        let i = r.indexOf('index') - start; //  children names
        if (i < paths.length) {
          for (let a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '');
            }
            if (a < i && names[a] !== r[a]) {
              break;
            }
          }
        }
      });
      route.path = (isChild ? '' : '/') + paths.join('/');
    }
    route.name = route.name.replace(/-index$/, '');
    if (route.children) {
      if (route.children.find(child => child.path === '')) {
        delete route.name;
      }
      route.children = cleanChildrenRoutes(route.children, true);
    }
  });
  return routes;
}

function createRoutes(files, srcDir) {
  let routes = [];
  files.forEach(file => {
    let keys = file.replace(/^pages/, '').replace(/\.vue$/, '').replace(/\/{2,}/g, '/').split('/').slice(1);
    let route = { name: '', path: '', component: r(srcDir, file) };
    let parent = routes;
    keys.forEach((key, i) => {
      route.name = route.name ? route.name + '-' + key.replace('_', '') : key.replace('_', '');
      route.name += key === '_' ? 'all' : '';
      route.chunkName = file.replace(/\.vue$/, '');
      let child = ___default.find(parent, { name: route.name });
      if (child) {
        child.children = child.children || [];
        parent = child.children;
        route.path = '';
      } else {
        if (key === 'index' && i + 1 === keys.length) {
          route.path += i > 0 ? '' : '/';
        } else {
          route.path += '/' + (key === '_' ? '*' : key.replace('_', ':'));
          if (key !== '_' && key.indexOf('_') !== -1) {
            route.path += '?';
          }
        }
      }
    });
    // Order Routes path
    parent.push(route);
    parent.sort((a, b) => {
      if (!a.path.length || a.path === '/') {
        return -1;
      }
      if (!b.path.length || b.path === '/') {
        return 1;
      }
      let i = 0;
      let res = 0;
      let y = 0;
      let z = 0;
      const _a = a.path.split('/');
      const _b = b.path.split('/');
      for (i = 0; i < _a.length; i++) {
        if (res !== 0) {
          break;
        }
        y = _a[i] === '*' ? 2 : _a[i].indexOf(':') > -1 ? 1 : 0;
        z = _b[i] === '*' ? 2 : _b[i].indexOf(':') > -1 ? 1 : 0;
        res = y - z;
        // If a.length >= b.length
        if (i === _b.length - 1 && res === 0) {
          // change order if * found
          res = _a[i] === '*' ? -1 : 1;
        }
      }
      return res === 0 ? _a[i - 1] === '*' && _b[i] ? 1 : -1 : res;
    });
  });
  return cleanChildrenRoutes(routes);
}



var Utils = Object.freeze({
	encodeHtml: encodeHtml,
	getContext: getContext,
	setAnsiColors: setAnsiColors,
	waitFor: waitFor,
	urlJoin: urlJoin,
	isUrl: isUrl,
	promisifyRoute: promisifyRoute,
	sequence: sequence,
	parallel: parallel,
	chainFn: chainFn,
	isPureObject: isPureObject,
	isWindows: isWindows,
	wp: wp,
	wChunk: wChunk,
	r: r,
	relativeTo: relativeTo,
	flatRoutes: flatRoutes,
	cleanChildrenRoutes: cleanChildrenRoutes,
	createRoutes: createRoutes
});

const debug = Debug('nuxt:build');
debug.color = 2; // Force green color

const Options = {};

Options.from = function (_options) {
  // Clone options to prevent unwanted side-effects
  const options = Object.assign({}, _options);

  // Normalize options
  if (options.loading === true) {
    delete options.loading;
  }
  if (options.router && options.router.middleware && !Array.isArray(options.router.middleware)) {
    options.router.middleware = [options.router.middleware];
  }
  if (options.router && typeof options.router.base === 'string') {
    options._routerBaseSpecified = true;
  }
  if (typeof options.transition === 'string') {
    options.transition = { name: options.transition };
  }
  if (typeof options.layoutTransition === 'string') {
    options.layoutTransition = { name: options.layoutTransition };
  }

  // Apply defaults
  ___default.defaultsDeep(options, Options.defaults);

  // Resolve dirs
  const hasValue = v => typeof v === 'string' && v;
  options.rootDir = hasValue(options.rootDir) ? options.rootDir : process.cwd();
  options.srcDir = hasValue(options.srcDir) ? path.resolve(options.rootDir, options.srcDir) : options.rootDir;
  options.modulesDir = path.resolve(options.rootDir, hasValue(options.modulesDir) ? options.modulesDir : 'node_modules');
  options.buildDir = path.resolve(options.rootDir, options.buildDir);
  options.cacheDir = path.resolve(options.rootDir, options.cacheDir);

  // If app.html is defined, set the template path to the user template
  options.appTemplatePath = path.resolve(options.buildDir, 'views/app.template.html');
  if (fs.existsSync(path.join(options.srcDir, 'app.html'))) {
    options.appTemplatePath = path.join(options.srcDir, 'app.html');
  }

  // Ignore publicPath on dev
  /* istanbul ignore if */
  if (options.dev && isUrl(options.build.publicPath)) {
    options.build.publicPath = Options.defaults.build.publicPath;
  }

  // If store defined, update store options to true unless explicitly disabled
  if (options.store !== false && fs.existsSync(path.join(options.srcDir, 'store'))) {
    options.store = true;
  }

  // Normalize loadingIndicator
  if (!isPureObject(options.loadingIndicator)) {
    options.loadingIndicator = { name: options.loadingIndicator };
  }

  // Apply defaults to loadingIndicator
  options.loadingIndicator = Object.assign({
    name: 'pulse',
    color: '#dbe1ec',
    background: 'white'
  }, options.loadingIndicator);

  // cssSourceMap
  if (options.build.cssSourceMap === undefined) {
    options.build.cssSourceMap = options.dev;
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
    let postcssConfigPath;
    for (let dir of [options.srcDir, options.rootDir]) {
      for (let file of ['postcss.config.js', '.postcssrc.js', '.postcssrc', '.postcssrc.json', '.postcssrc.yaml']) {
        if (fs.existsSync(path.resolve(dir, file))) {
          postcssConfigPath = path.resolve(dir, file);
          break;
        }
      }
      if (postcssConfigPath) break;
    }

    // Default postcss options
    if (postcssConfigPath) {
      debug(`Using PostCSS config file: ${postcssConfigPath}`);
      options.build.postcss = {
        sourceMap: options.build.cssSourceMap,
        // https://github.com/postcss/postcss-loader/blob/master/lib/index.js#L79
        config: {
          path: postcssConfigPath
        }
      };
    } else {
      if (Object.keys(options.build.postcss).length) {
        debug('Using PostCSS config from `build.postcss`');
      }
      // Normalize & Apply default plugins
      if (Array.isArray(options.build.postcss)) {
        options.build.postcss = { plugins: options.build.postcss };
      }
      if (isPureObject(options.build.postcss)) {
        options.build.postcss = Object.assign({
          sourceMap: options.build.cssSourceMap,
          plugins: {
            // https://github.com/postcss/postcss-import
            'postcss-import': {
              root: options.rootDir,
              path: [options.srcDir, options.rootDir, options.modulesDir]
            },
            // https://github.com/postcss/postcss-url
            'postcss-url': {},
            // http://cssnext.io/postcss
            'postcss-cssnext': {}
          }
        }, options.build.postcss);
      }
    }
  }

  // Debug errors
  if (options.debug === undefined) {
    options.debug = options.dev;
  }

  // Apply mode preset
  let modePreset = Options.modes[options.mode || 'universal'] || Options.modes['universal'];
  ___default.defaultsDeep(options, modePreset);

  // If no server-side rendering, add appear true transition
  if (options.render.ssr === false) {
    options.transition.appear = true;
  }

  return options;
};

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
};

Options.defaults = {
  mode: 'universal',
  dev: process.env.NODE_ENV !== 'production',
  debug: undefined, // Will be equal to dev if not provided
  buildDir: '.nuxt',
  cacheDir: '.cache',
  nuxtAppDir: path.resolve(__dirname, '../lib/app/'), // Relative to dist
  build: {
    analyze: false,
    dll: false,
    extractCSS: false,
    cssSourceMap: undefined,
    ssr: undefined,
    publicPath: '/_nuxt/',
    filenames: {
      css: 'common.[contenthash].css',
      manifest: 'manifest.[hash].js',
      vendor: 'common.[chunkhash].js',
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
    client_error_details: 'An error occurred while rendering the page. Check developer tools console for details.'
  }
};

const debug$1 = Debug('nuxt:module');

class ModuleContainer {
  constructor(nuxt) {
    this.nuxt = nuxt;
    this.options = nuxt.options;
    this.requiredModules = [];
  }

  ready() {
    var _this = this;

    return asyncToGenerator(function* () {
      yield _this.nuxt.callHook('modules:before', _this, _this.options.modules);
      // Load every module in sequence
      yield sequence(_this.options.modules, _this.addModule.bind(_this));
      // Call done hook
      yield _this.nuxt.callHook('modules:done', _this);
    })();
  }

  addVendor(vendor) {
    /* istanbul ignore if */
    if (!vendor) {
      return;
    }
    this.options.build.vendor = _.uniq(this.options.build.vendor.concat(vendor));
  }

  addTemplate(template) {
    /* istanbul ignore if */
    if (!template) {
      return;
    }
    // Validate & parse source
    const src = template.src || template;
    const srcPath = path__default.parse(src);
    /* istanbul ignore if */
    if (!src || typeof src !== 'string' || !fs__default.existsSync(src)) {
      /* istanbul ignore next */
      debug$1('[nuxt] invalid template', template);
      return;
    }
    // Generate unique and human readable dst filename
    const dst = template.fileName || path__default.basename(srcPath.dir) + '.' + srcPath.name + '.' + hash(src) + srcPath.ext;
    // Add to templates list
    const templateObj = {
      src,
      dst,
      options: template.options
    };
    this.options.build.templates.push(templateObj);
    return templateObj;
  }

  addPlugin(template) {
    const { dst } = this.addTemplate(template);
    // Add to nuxt plugins
    this.options.plugins.unshift({
      src: path__default.join(this.options.buildDir, dst),
      ssr: template.ssr
    });
  }

  addServerMiddleware(middleware) {
    this.options.serverMiddleware.push(middleware);
  }

  extendBuild(fn) {
    this.options.build.extend = chainFn(this.options.build.extend, fn);
  }

  extendRoutes(fn) {
    this.options.router.extendRoutes = chainFn(this.options.router.extendRoutes, fn);
  }

  requireModule(moduleOpts) {
    // Require once
    return this.addModule(moduleOpts, true);
  }

  addModule(moduleOpts, requireOnce) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      /* istanbul ignore if */
      if (!moduleOpts) {
        return;
      }

      // Allow using babel style array options
      if (Array.isArray(moduleOpts)) {
        moduleOpts = {
          src: moduleOpts[0],
          options: moduleOpts[1]
        };
      }

      // Allows passing runtime options to each module
      const options = moduleOpts.options || (typeof moduleOpts === 'object' ? moduleOpts : {});
      const src = moduleOpts.src || moduleOpts;

      // Resolve module
      let module;
      if (typeof src === 'string') {
        module = require(_this2.nuxt.resolvePath(src));
      }

      // Validate module
      /* istanbul ignore if */
      if (typeof module !== 'function') {
        throw new Error(`[nuxt] Module ${JSON.stringify(src)} should export a function`);
      }

      // Module meta
      module.meta = module.meta || {};
      let name = module.meta.name || module.name;

      // If requireOnce specified & module from NPM or with specified name
      if (requireOnce && name) {
        const alreadyRequired = _this2.requiredModules.indexOf(name) !== -1;
        if (requireOnce && alreadyRequired) {
          return;
        }
        if (!alreadyRequired) {
          _this2.requiredModules.push(name);
        }
      }

      // Call module with `this` context and pass options
      yield new Promise(function (resolve$$1, reject) {
        const result = module.call(_this2, options, function (err) {
          /* istanbul ignore if */
          if (err) {
            return reject(err);
          }
          resolve$$1();
        });
        // If module send back a promise
        if (result && result.then instanceof Function) {
          return result.then(resolve$$1);
        }
        // If not expecting a callback but returns no promise (=synchronous)
        if (module.length < 2) {
          return resolve$$1();
        }
      });
    })();
  }
}

class MetaRenderer {
  constructor(nuxt, renderer) {
    this.nuxt = nuxt;
    this.renderer = renderer;
    this.options = nuxt.options;
    this.vueRenderer = VueServerRenderer__default.createRenderer();
    this.cache = LRU({});

    // Add VueMeta to Vue (this is only for SPA mode)
    // See lib/app/index.js
    Vue.use(VueMeta, {
      keyName: 'head',
      attribute: 'data-n-head',
      ssrAttribute: 'data-n-head-ssr',
      tagIDKeyName: 'hid'
    });
  }

  getMeta(url) {
    return new Promise((resolve$$1, reject) => {
      const vm = new Vue({
        render: h => h(), // Render empty html tag
        head: this.options.head || {}
      });
      this.vueRenderer.renderToString(vm, err => {
        if (err) return reject(err);
        resolve$$1(vm.$meta().inject());
      });
    });
  }

  render({ url = '/' }) {
    var _this = this;

    return asyncToGenerator(function* () {
      let meta = _this.cache.get(url);

      if (meta) {
        return meta;
      }

      meta = {
        HTML_ATTRS: '',
        BODY_ATTRS: '',
        HEAD: '',
        BODY_SCRIPTS: ''
        // Get vue-meta context
      };const m = yield _this.getMeta(url);
      // HTML_ATTRS
      meta.HTML_ATTRS = m.htmlAttrs.text();
      // BODY_ATTRS
      meta.BODY_ATTRS = m.bodyAttrs.text();
      // HEAD tags
      meta.HEAD = m.meta.text() + m.title.text() + m.link.text() + m.style.text() + m.script.text() + m.noscript.text();
      // BODY_SCRIPTS
      meta.BODY_SCRIPTS = m.script.text({ body: true });
      // Resources Hints
      meta.resourceHints = '';
      // Resource Hints
      const clientManifest = _this.renderer.resources.clientManifest;
      if (_this.options.render.resourceHints && clientManifest) {
        const publicPath = clientManifest.publicPath || '/_nuxt/';
        // Pre-Load initial resources
        if (Array.isArray(clientManifest.initial)) {
          meta.resourceHints += clientManifest.initial.map(function (r) {
            return `<link rel="preload" href="${publicPath}${r}" as="script" />`;
          }).join('');
        }
        // Pre-Fetch async resources
        if (Array.isArray(clientManifest.async)) {
          meta.resourceHints += clientManifest.async.map(function (r) {
            return `<link rel="prefetch" href="${publicPath}${r}" />`;
          }).join('');
        }
        // Add them to HEAD
        if (meta.resourceHints) {
          meta.HEAD += meta.resourceHints;
        }
      }

      // Set meta tags inside cache
      _this.cache.set(url, meta);

      return meta;
    })();
  }
}

const debug$3 = Debug('nuxt:render');
debug$3.color = 4; // Force blue color

setAnsiColors(ansiHTML);

let jsdom = null;

class Renderer {
  constructor(nuxt) {
    this.nuxt = nuxt;
    this.options = nuxt.options;

    // Will be set by createRenderer
    this.bundleRenderer = null;
    this.metaRenderer = null;

    // Will be available on dev
    this.webpackDevMiddleware = null;
    this.webpackHotMiddleware = null;

    // Create new connect instance
    this.app = connect();

    // Renderer runtime resources
    this.resources = {
      clientManifest: null,
      serverBundle: null,
      ssrTemplate: null,
      spaTemplate: null,
      errorTemplate: parseTemplate('Nuxt.js Internal Server Error')
    };
  }

  ready() {
    var _this2 = this;

    return asyncToGenerator(function* () {
      yield _this2.nuxt.callHook('render:before', _this2, _this2.options.render);
      // Setup nuxt middleware
      yield _this2.setupMiddleware();

      // Production: Load SSR resources from fs
      if (!_this2.options.dev) {
        yield _this2.loadResources();
      }

      // Call done hook
      yield _this2.nuxt.callHook('render:done', _this2);
    })();
  }

  loadResources(_fs = fs$1__default) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      let distPath = path.resolve(_this3.options.buildDir, 'dist');
      let updated = [];

      resourceMap.forEach(function ({ key, fileName, transform }) {
        let rawKey = '$$' + key;
        const path$$1 = path.join(distPath, fileName);

        let rawData, data;
        if (!_fs.existsSync(path$$1)) {
          return; // Resource not exists
        }
        rawData = _fs.readFileSync(path$$1, 'utf8');
        if (!rawData || rawData === _this3.resources[rawKey]) {
          return; // No changes
        }
        _this3.resources[rawKey] = rawData;
        data = transform(rawData);
        /* istanbul ignore if */
        if (!data) {
          return; // Invalid data ?
        }
        _this3.resources[key] = data;
        updated.push(key);
      });

      // Reload error template
      const errorTemplatePath = path.resolve(_this3.options.buildDir, 'views/error.html');
      if (fs$1__default.existsSync(errorTemplatePath)) {
        _this3.resources.errorTemplate = parseTemplate(fs$1__default.readFileSync(errorTemplatePath, 'utf8'));
      }

      // Load loading template
      const loadingHTMLPath = path.resolve(_this3.options.buildDir, 'loading.html');
      if (fs$1__default.existsSync(loadingHTMLPath)) {
        _this3.resources.loadingHTML = fs$1__default.readFileSync(loadingHTMLPath, 'utf8');
        _this3.resources.loadingHTML = _this3.resources.loadingHTML.replace(/[\r|\n]/g, '');
      } else {
        _this3.resources.loadingHTML = '';
      }

      // Call resourcesLoaded plugin
      yield _this3.nuxt.callHook('render:resourcesLoaded', _this3.resources);

      if (updated.length > 0) {
        _this3.createRenderer();
      }
    })();
  }

  get noSSR() {
    return this.options.render.ssr === false;
  }

  get isReady() {
    if (this.noSSR) {
      return Boolean(this.resources.spaTemplate);
    }

    return Boolean(this.bundleRenderer && this.resources.ssrTemplate);
  }

  get isResourcesAvailable() {
    // Required for both
    if (!this.resources.clientManifest) {
      return false;
    }

    // Required for SPA rendering
    if (this.noSSR) {
      return Boolean(this.resources.spaTemplate);
    }

    // Required for bundle renderer
    return Boolean(this.resources.ssrTemplate && this.resources.serverBundle);
  }

  createRenderer() {
    // Ensure resources are available
    if (!this.isResourcesAvailable) {
      return;
    }

    // Create Meta Renderer
    this.metaRenderer = new MetaRenderer(this.nuxt, this);

    // Skip following steps if noSSR mode
    if (this.noSSR) {
      return;
    }

    // Create bundle renderer for SSR
    this.bundleRenderer = VueServerRenderer.createBundleRenderer(this.resources.serverBundle, Object.assign({
      clientManifest: this.resources.clientManifest,
      runInNewContext: false,
      basedir: this.options.rootDir
    }, this.options.render.bundleRenderer));
  }

  useMiddleware(m) {
    // Resolve
    const $m = m;
    let src;
    if (typeof m === 'string') {
      src = this.nuxt.resolvePath(m);
      m = require(src);
    }
    if (typeof m.handler === 'string') {
      src = this.nuxt.resolvePath(m.handler);
      m.handler = require(src);
    }

    const handler = m.handler || m;
    const path$$1 = ((m.prefix !== false ? this.options.router.base : '') + (typeof m.path === 'string' ? m.path : '')).replace(/\/\//g, '/');

    // Inject $src and $m to final handler
    if (src) handler.$src = src;
    handler.$m = $m;

    // Use middleware
    this.app.use(path$$1, handler);
  }

  get publicPath() {
    return isUrl(this.options.build.publicPath) ? Options.defaults.build.publicPath : this.options.build.publicPath;
  }

  setupMiddleware() {
    var _this4 = this;

    return asyncToGenerator(function* () {
      // Apply setupMiddleware from modules first
      yield _this4.nuxt.callHook('render:setupMiddleware', _this4.app);

      // Gzip middleware for production
      if (!_this4.options.dev && _this4.options.render.gzip) {
        _this4.useMiddleware(compression(_this4.options.render.gzip));
      }

      // Common URL checks
      _this4.useMiddleware(function (req, res, next) {
        // Prevent access to SSR resources
        if (ssrResourceRegex.test(req.url)) {
          res.statusCode = 404;
          return res.end();
        }
        next();
      });

      // Add webpack middleware only for development
      if (_this4.options.dev) {
        _this4.useMiddleware((() => {
          var _ref = asyncToGenerator(function* (req, res, next) {
            if (_this4.webpackDevMiddleware) {
              yield _this4.webpackDevMiddleware(req, res);
            }
            if (_this4.webpackHotMiddleware) {
              yield _this4.webpackHotMiddleware(req, res);
            }
            next();
          });

          return function (_x, _x2, _x3) {
            return _ref.apply(this, arguments);
          };
        })());
      }

      // open in editor for debug mode only
      const _this = _this4;
      if (_this4.options.debug) {
        _this4.useMiddleware({
          path: '_open',
          handler(req, res) {
            // Lazy load open-in-editor
            const openInEditor = require('open-in-editor');
            const editor = openInEditor.configure(_this.options.editor);
            // Parse Query
            const query = req.url.split('?')[1].split('&').reduce((q, part) => {
              const s = part.split('=');
              q[s[0]] = decodeURIComponent(s[1]);
              return q;
            }, {});
            // eslint-disable-next-line no-console
            console.log('[open in editor]', query.file);
            editor.open(query.file).then(() => {
              res.end('opened in editor!');
            }).catch(err => {
              res.end(err);
            });
          }
        });
      }

      // For serving static/ files to /
      _this4.useMiddleware(serveStatic(path.resolve(_this4.options.srcDir, 'static'), _this4.options.render.static));

      // Serve .nuxt/dist/ files only for production
      // For dev they will be served with devMiddleware
      if (!_this4.options.dev) {
        const distDir = path.resolve(_this4.options.buildDir, 'dist');
        _this4.useMiddleware({
          path: _this4.publicPath,
          handler: serveStatic(distDir, {
            index: false, // Don't serve index.html template
            maxAge: '1y' // 1 year in production
          })
        });
      }

      // Add User provided middleware
      _this4.options.serverMiddleware.forEach(function (m) {
        _this4.useMiddleware(m);
      });

      // Finally use nuxtMiddleware
      _this4.useMiddleware(_this4.nuxtMiddleware.bind(_this4));

      // Error middleware for errors that occurred in middleware that declared above
      // Middleware should exactly take 4 arguments
      // https://github.com/senchalabs/connect#error-middleware
      _this4.useMiddleware(_this4.errorMiddleware.bind(_this4));
    })();
  }

  nuxtMiddleware(req, res, next) {
    var _this5 = this;

    return asyncToGenerator(function* () {
      // Get context
      const context = getContext(req, res);

      res.statusCode = 200;
      try {
        const result = yield _this5.renderRoute(req.url, context);
        yield _this5.nuxt.callHook('render:route', req.url, result);
        const { html, error, redirected, resourceHints } = result;

        if (redirected) {
          return html;
        }
        if (error) {
          res.statusCode = context.nuxt.error.statusCode || 500;
        }

        // Add ETag header
        if (!error && _this5.options.render.etag) {
          const etag = generateETag(html, _this5.options.render.etag);
          if (fresh(req.headers, { etag })) {
            res.statusCode = 304;
            res.end();
            return;
          }
          res.setHeader('ETag', etag);
        }

        // HTTP2 push headers
        if (!error && _this5.options.render.http2.push) {
          // Parse resourceHints to extract HTTP.2 prefetch/push headers
          // https://w3c.github.io/preload/#server-push-http-2
          const regex = /link rel="([^"]*)" href="([^"]*)" as="([^"]*)"/g;
          const pushAssets = [];
          let m;
          while (m = regex.exec(resourceHints)) {
            // eslint-disable-line no-cond-assign
            const [_$$1, rel, href, as] = m; // eslint-disable-line no-unused-vars
            if (rel === 'preload') {
              pushAssets.push(`<${href}>; rel=${rel}; as=${as}`);
            }
          }
          // Pass with single Link header
          // https://blog.cloudflare.com/http-2-server-push-with-multiple-assets-per-link-header
          res.setHeader('Link', pushAssets.join(','));
        }

        // Send response
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(html));
        res.end(html, 'utf8');
        return html;
      } catch (err) {
        /* istanbul ignore if */
        if (context && context.redirected) {
          console.error(err); // eslint-disable-line no-console
          return err;
        }

        next(err);
      }
    })();
  }

  errorMiddleware(err, req, res, next) {
    // ensure statusCode, message and name fields
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Nuxt Server Error';
    err.name = !err.name || err.name === 'Error' ? 'NuxtServerError' : err.name;

    // We hide actual errors from end users, so show them on server logs
    if (err.statusCode !== 404) {
      console.error(err); // eslint-disable-line no-console
    }

    const sendResponse = (content, type = 'text/html') => {
      // Set Headers
      res.statusCode = err.statusCode;
      res.statusMessage = err.name;
      res.setHeader('Content-Type', type + '; charset=utf-8');
      res.setHeader('Content-Length', Buffer.byteLength(content));

      // Send Response
      res.end(content, 'utf-8');
    };

    // Check if request accepts JSON
    const hasReqHeader = (header, includes) => req.headers[header] && req.headers[header].toLowerCase().indexOf(includes) !== -1;
    const isJson = hasReqHeader('accept', 'application/json') || hasReqHeader('user-agent', 'curl/');

    // Use basic errors when debug mode is disabled
    if (!this.options.debug) {
      // Json format is compatible with Youch json responses
      const json = {
        status: err.statusCode,
        message: err.message,
        name: err.name
      };
      if (isJson) {
        sendResponse(JSON.stringify(json, undefined, 2), 'text/json');
        return;
      }
      const html = this.resources.errorTemplate(json);
      sendResponse(html);
      return;
    }

    // Show stack trace
    const youch = new Youch(err, req, this.readSource.bind(this));
    if (isJson) {
      youch.toJSON().then(json => {
        sendResponse(JSON.stringify(json, undefined, 2), 'text/json');
      });
    } else {
      youch.toHTML().then(html => {
        sendResponse(html);
      });
    }
  }

  readSource(frame) {
    var _this6 = this;

    return asyncToGenerator(function* () {
      const serverBundle = _this6.resources.serverBundle;

      // Remove webpack:/// & query string from the end
      const sanitizeName = function (name) {
        return name ? name.replace('webpack:///', '').split('?')[0] : '';
      };

      // SourceMap Support for SSR Bundle
      if (serverBundle && serverBundle.maps[frame.fileName]) {
        // Initialize smc cache
        if (!serverBundle.$maps) {
          serverBundle.$maps = {};
        }

        // Read SourceMap object
        const smc = serverBundle.$maps[frame.fileName] || new sourceMap.SourceMapConsumer(serverBundle.maps[frame.fileName]);
        serverBundle.$maps[frame.fileName] = smc;

        // Try to find original position
        const { line, column, name, source } = smc.originalPositionFor({
          line: frame.getLineNumber() || 0,
          column: frame.getColumnNumber() || 0,
          bias: sourceMap.SourceMapConsumer.LEAST_UPPER_BOUND
        });
        if (line) {
          frame.lineNumber = line;
        }
        if (column) {
          frame.columnNumber = column;
        }
        if (name) {
          frame.functionName = name;
        }
        if (source) {
          frame.fileName = sanitizeName(source);

          // Source detected, try to get original source code
          const contents = smc.sourceContentFor(source);
          if (contents) {
            frame.contents = contents;
          }
        }
      }

      // Return if fileName is still unknown
      if (!frame.fileName) {
        return;
      }

      frame.fileName = sanitizeName(frame.fileName);

      // Try to read from SSR bundle files
      if (serverBundle && serverBundle.files[frame.fileName]) {
        frame.contents = serverBundle.files[frame.fileName];
        return;
      }

      // Possible paths for file
      const searchPath = [_this6.options.rootDir, path.join(_this6.options.buildDir, 'dist'), _this6.options.srcDir, _this6.options.buildDir];

      // Scan filesystem for real path
      for (let pathDir of searchPath) {
        let fullPath = path.resolve(pathDir, frame.fileName);
        let source = yield fs$1__default.readFile(fullPath, 'utf-8').catch(function () {
          return null;
        });
        if (source) {
          if (!frame.contents) {
            frame.contents = source;
          }
          frame.fullPath = fullPath;
          return;
        }
      }
    })();
  }

  renderRoute(url, context = {}) {
    var _this7 = this;

    return asyncToGenerator(function* () {
      /* istanbul ignore if */
      if (!_this7.isReady) {
        return new Promise(function (resolve$$1) {
          setTimeout(function () {
            return resolve$$1(_this7.renderRoute(url, context));
          }, 1000);
        });
      }

      // Log rendered url
      debug$3(`Rendering url ${url}`);

      // Add url and isSever to the context
      context.url = url;

      // Basic response if SSR is disabled or spa data provided
      const spa = context.spa || context.res && context.res.spa;
      const ENV = _this7.options.env;

      if (_this7.noSSR || spa) {
        const { HTML_ATTRS, BODY_ATTRS, HEAD, BODY_SCRIPTS, resourceHints } = yield _this7.metaRenderer.render(context);
        const APP = `<div id="__nuxt">${_this7.resources.loadingHTML}</div>` + BODY_SCRIPTS;

        // Detect 404 errors
        if (url.indexOf(_this7.options.build.publicPath) !== -1 || url.indexOf('__webpack') !== -1) {
          const err = { statusCode: 404, message: _this7.options.messages.error_404, name: 'ResourceNotFound' };
          throw err;
        }

        const html = _this7.resources.spaTemplate({
          HTML_ATTRS,
          BODY_ATTRS,
          HEAD,
          APP,
          ENV
        });

        return { html, resourceHints };
      }

      // Call renderToString from the bundleRenderer and generate the HTML (will update the context as well)
      let APP = yield _this7.bundleRenderer.renderToString(context);

      if (!context.nuxt.serverRendered) {
        APP = '<div id="__nuxt"></div>';
      }
      const m = context.meta.inject();
      let HEAD = m.meta.text() + m.title.text() + m.link.text() + m.style.text() + m.script.text() + m.noscript.text();
      if (_this7.options._routerBaseSpecified) {
        HEAD += `<base href="${_this7.options.router.base}">`;
      }

      let resourceHints = '';

      if (_this7.options.render.resourceHints) {
        resourceHints = context.renderResourceHints();
        HEAD += resourceHints;
      }
      APP += `<script type="text/javascript">window.__NUXT__=${serialize(context.nuxt, { isJSON: true })};</script>`;
      APP += context.renderScripts();
      APP += m.script.text({ body: true });

      HEAD += context.renderStyles();

      let html = _this7.resources.ssrTemplate({
        HTML_ATTRS: 'data-n-head-ssr ' + m.htmlAttrs.text(),
        BODY_ATTRS: m.bodyAttrs.text(),
        HEAD,
        APP,
        ENV
      });

      return {
        html,
        resourceHints,
        error: context.nuxt.error,
        redirected: context.redirected
      };
    })();
  }

  renderAndGetWindow(url, opts = {}) {
    var _this8 = this;

    return asyncToGenerator(function* () {
      /* istanbul ignore if */
      if (!jsdom) {
        try {
          jsdom = require('jsdom');
        } catch (e) /* istanbul ignore next */{
          console.error('Fail when calling nuxt.renderAndGetWindow(url)'); // eslint-disable-line no-console
          console.error('jsdom module is not installed'); // eslint-disable-line no-console
          console.error('Please install jsdom with: npm install --save-dev jsdom'); // eslint-disable-line no-console
          throw e;
        }
      }
      let options = {
        resources: 'usable', // load subresources (https://github.com/tmpvar/jsdom#loading-subresources)
        runScripts: 'dangerously',
        beforeParse(window) {
          // Mock window.scrollTo
          window.scrollTo = () => {};
        }
      };
      if (opts.virtualConsole !== false) {
        options.virtualConsole = new jsdom.VirtualConsole().sendTo(console);
      }
      url = url || 'http://localhost:3000';
      const { window } = yield jsdom.JSDOM.fromURL(url, options);
      // If Nuxt could not be loaded (error from the server-side)
      const nuxtExists = window.document.body.innerHTML.indexOf(_this8.options.render.ssr ? 'window.__NUXT__' : '<div id="__nuxt">') !== -1;
      /* istanbul ignore if */
      if (!nuxtExists) {
        let error = new Error('Could not load the nuxt app');
        error.body = window.document.body.innerHTML;
        throw error;
      }
      // Used by nuxt.js to say when the components are loaded and the app ready
      yield new Promise(function (resolve$$1) {
        window._onNuxtLoaded = function () {
          return resolve$$1(window);
        };
      });
      // Send back window object
      return window;
    })();
  }
}

const parseTemplate = templateStr => ___default.template(templateStr, {
  interpolate: /{{([\s\S]+?)}}/g
});

const resourceMap = [{
  key: 'clientManifest',
  fileName: 'vue-ssr-client-manifest.json',
  transform: JSON.parse
}, {
  key: 'serverBundle',
  fileName: 'server-bundle.json',
  transform: JSON.parse
}, {
  key: 'ssrTemplate',
  fileName: 'index.ssr.html',
  transform: parseTemplate
}, {
  key: 'spaTemplate',
  fileName: 'index.spa.html',
  transform: parseTemplate
}];

// Protector utility against request to SSR bundle files
const ssrResourceRegex = new RegExp(resourceMap.map(resource => resource.fileName).join('|'), 'i');

const debug$2 = Debug('nuxt:');
debug$2.color = 5;

class Nuxt {
  constructor(options = {}) {
    this.options = Options.from(options);

    // Paths for resolving requires from `rootDir`
    this.nodeModulePaths = Module._nodeModulePaths(this.options.rootDir);

    this.initialized = false;
    this.errorHandler = this.errorHandler.bind(this);
    // Hooks
    this._hooks = {};
    this.hook = this.hook.bind(this);

    // Create instance of core components
    this.moduleContainer = new ModuleContainer(this);
    this.renderer = new Renderer(this);

    // Backward compatibility
    this.render = this.renderer.app;
    this.renderRoute = this.renderer.renderRoute.bind(this.renderer);
    this.renderAndGetWindow = this.renderer.renderAndGetWindow.bind(this.renderer);

    this._ready = this.ready().catch(this.errorHandler);
  }

  ready() {
    var _this = this;

    return asyncToGenerator(function* () {
      if (_this._ready) {
        return _this._ready;
      }

      // Add hooks
      if (_.isPlainObject(_this.options.hooks)) {
        _this.addObjectHooks(_this.options.hooks);
      } else if (typeof _this.options.hooks === 'function') {
        _this.options.hooks(_this.hook);
      }
      // Add nuxt modules
      yield _this.moduleContainer.ready();
      yield _this.renderer.ready();

      _this.initialized = true;
      yield _this.callHook('ready', _this);

      return _this;
    })();
  }

  hook(name, fn) {
    if (!name || typeof fn !== 'function') {
      return;
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(fn);
  }

  callHook(name, ...args) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      if (!_this2._hooks[name]) {
        return;
      }
      debug$2(`Call ${name} hooks (${_this2._hooks[name].length})`);
      try {
        yield sequence(_this2._hooks[name], function (fn) {
          return fn(...args);
        });
      } catch (err) {
        console.error(`> Error on hook "${name}":`); // eslint-disable-line no-console
        console.error(err); // eslint-disable-line no-console
      }
    })();
  }

  addObjectHooks(hooksObj) {
    Object.keys(hooksObj).forEach(name => {
      let hooks = hooksObj[name];
      hooks = Array.isArray(hooks) ? hooks : [hooks];

      hooks.forEach(hook => {
        this.hook(name, hook);
      });
    });
  }

  listen(port = 3000, host = 'localhost') {
    return new Promise((resolve$$1, reject) => {
      const server = this.renderer.app.listen({ port, host, exclusive: false }, err => {
        /* istanbul ignore if */
        if (err) {
          return reject(err);
        }

        const _host = host === '0.0.0.0' ? 'localhost' : host;
        // eslint-disable-next-line no-console
        console.log('\n' + chalk.bgGreen.black(' OPEN ') + chalk.green(` http://${_host}:${port}\n`));

        // Close server on nuxt close
        this.hook('close', () => new Promise((resolve$$1, reject) => {
          // Destroy server by forcing every connection to be closed
          server.destroy(err => {
            debug$2('server closed');
            /* istanbul ignore if */
            if (err) {
              return reject(err);
            }
            resolve$$1();
          });
        }));

        this.callHook('listen', server, { port, host }).then(resolve$$1);
      });

      // Add server.destroy(cb) method
      enableDestroy(server);
    });
  }

  errorHandler /* istanbul ignore next */() {
    // Apply plugins
    // eslint-disable-next-line no-console
    this.callHook('error', ...arguments).catch(console.error);

    // Silent
    if (this.options.errorHandler === false) {
      return;
    }

    // Custom errorHandler
    if (typeof this.options.errorHandler === 'function') {
      return this.options.errorHandler.apply(this, arguments);
    }

    // Default handler
    // eslint-disable-next-line no-console
    console.error(...arguments);
  }

  resolvePath(path$$1) {
    // Try to resolve using NPM resolve path first
    try {
      let resolvedPath = Module._resolveFilename(path$$1, { paths: this.nodeModulePaths });
      return resolvedPath;
    } catch (e) {}
    // Just continue

    // Shorthand to resolve from project dirs
    if (path$$1.indexOf('@@') === 0 || path$$1.indexOf('~~') === 0) {
      return path.join(this.options.rootDir, path$$1.substr(2));
    } else if (path$$1.indexOf('@') === 0 || path$$1.indexOf('~') === 0) {
      return path.join(this.options.srcDir, path$$1.substr(1));
    }
    return path.resolve(this.options.srcDir, path$$1);
  }

  close(callback) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      yield _this3.callHook('close', _this3);

      /* istanbul ignore if */
      if (typeof callback === 'function') {
        yield callback();
      }
    })();
  }
}



var core = Object.freeze({
	Nuxt: Nuxt,
	Module: ModuleContainer,
	Renderer: Renderer,
	Options: Options,
	Utils: Utils
});

/*
|--------------------------------------------------------------------------
| Webpack Shared Config
|
| This is the config which is extended by the server and client
| webpack config files
|--------------------------------------------------------------------------
*/
function webpackBaseConfig(name) {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');

  const config = {
    name,
    devtool: this.options.dev ? 'cheap-module-source-map' : 'nosources-source-map',
    entry: {
      app: null
    },
    output: {
      path: path.resolve(this.options.buildDir, 'dist'),
      filename: this.options.build.filenames.app,
      chunkFilename: this.options.build.filenames.chunk,
      publicPath: isUrl(this.options.build.publicPath) ? this.options.build.publicPath : urlJoin(this.options.router.base, this.options.build.publicPath)
    },
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 300000,
      hints: this.options.dev ? false : 'warning'
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts'],
      alias: {
        '~': path.join(this.options.srcDir),
        '~~': path.join(this.options.rootDir),
        '@': path.join(this.options.srcDir),
        '@@': path.join(this.options.rootDir),
        // Used by vue-loader so we can use in templates
        // with <img src="~/assets/nuxt.png"/>
        'assets': path.join(this.options.srcDir, 'assets'),
        'static': path.join(this.options.srcDir, 'static')
      },
      modules: [this.options.modulesDir, nodeModulesDir]
    },
    resolveLoader: {
      modules: [this.options.modulesDir, nodeModulesDir]
    },
    module: {
      noParse: /es6-promise\.js$/, // Avoid webpack shimming process
      rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: this.vueLoader()
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: Object.assign({}, this.babelOptions)
      }, { test: /\.css$/, use: this.styleLoader('css') }, { test: /\.less$/, use: this.styleLoader('less', 'less-loader') }, { test: /\.sass$/, use: this.styleLoader('sass', { loader: 'sass-loader', options: { indentedSyntax: true } }) }, { test: /\.scss$/, use: this.styleLoader('scss', 'sass-loader') }, { test: /\.styl(us)?$/, use: this.styleLoader('stylus', 'stylus-loader') }, {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 1000, // 1KO
          name: 'img/[name].[hash:7].[ext]'
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000, // 1 KO
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }, {
        test: /\.(webm|mp4)$/,
        loader: 'file-loader',
        options: {
          name: 'videos/[name].[hash:7].[ext]'
        }
      }]
    },
    plugins: this.options.build.plugins

    // CSS extraction
  };if (this.options.build.extractCSS) {
    config.plugins.push(new ExtractTextPlugin({
      filename: this.options.build.filenames.css
    }));
  }

  // Workaround for hiding Warnings about plugins without a default export (#1179)
  config.plugins.push({
    apply(compiler) {
      compiler.plugin('done', stats => {
        stats.compilation.warnings = stats.compilation.warnings.filter(warn => {
          if (warn.name === 'ModuleDependencyWarning' && warn.message.indexOf(`export 'default'`) !== -1 && warn.message.indexOf('plugin') !== -1) {
            return false;
          }
          return true;
        });
      });
    }
  });

  // --------------------------------------
  // Dev specific config
  // --------------------------------------
  if (!this.options.dev) {
    // This is needed in webpack 2 for minify CSS
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      minimize: true
    }));
  }

  // Clone deep avoid leaking config between Client and Server
  return _.cloneDeep(config);
}

const debug$5 = Debug('nuxt:build');
debug$5.color = 2; // Force green color

/*
|--------------------------------------------------------------------------
| Webpack Client Config
|
| Generate public/dist/client-vendor-bundle.js
| Generate public/dist/client-bundle.js
|
| In production, will generate public/dist/style.css
|--------------------------------------------------------------------------
*/
function webpackClientConfig() {
  let config = webpackBaseConfig.call(this, 'client');

  // App entry
  config.entry.app = path.resolve(this.options.buildDir, 'client.js');
  config.entry.common = this.vendor();

  // Extract vendor chunks for better caching
  const _this = this;
  const totalPages = _this.routes ? _this.routes.length : 0;

  // This well-known vendor may exist as a dependency of other requests.
  const maybeVendor = ['/core-js/', '/regenerator-runtime/', '/es6-promise/', '/babel-runtime/', '/lodash/'];

  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: this.options.build.filenames.vendor,
    minChunks(module, count) {
      // In the dev we use on-demand-entries.
      // So, it makes no sense to use commonChunks based on the minChunks count.
      // Instead, we move all the code in node_modules into each of the pages.
      if (_this.options.dev) {
        return false;
      }

      // Detect and externalize well-known vendor if detected
      if (module.context && maybeVendor.some(v => module.context.indexOf(v) !== -1)) {
        return true;
      }

      // A module is extracted into the vendor chunk when...
      return (
        // If it's inside node_modules
        /node_modules/.test(module.context) &&
        // Do not externalize if the request is a CSS file
        !/\.(css|less|scss|sass|styl|stylus)$/.test(module.request) && (
        // Used in at-least 1/2 of the total pages
        totalPages <= 2 ? count >= totalPages : count >= totalPages * 0.5)
      );
    }
  }));

  // Env object defined in nuxt.config.js
  let env = {};
  _.each(this.options.env, (value, key) => {
    env['process.env.' + key] = ['boolean', 'number'].indexOf(typeof value) !== -1 ? value : JSON.stringify(value);
  });

  // Webpack common plugins
  /* istanbul ignore if */
  if (!Array.isArray(config.plugins)) {
    config.plugins = [];
  }

  // Generate output HTML for SPA
  config.plugins.push(new HTMLPlugin({
    filename: 'index.spa.html',
    template: this.options.appTemplatePath,
    inject: true,
    chunksSortMode: 'dependency'
  }));

  // Generate output HTML for SSR
  if (this.options.build.ssr) {
    config.plugins.push(new HTMLPlugin({
      filename: 'index.ssr.html',
      template: this.options.appTemplatePath,
      inject: false // Resources will be injected using bundleRenderer
    }));
  }

  // Generate vue-ssr-client-manifest
  config.plugins.push(new VueSSRClientPlugin({
    filename: 'vue-ssr-client-manifest.json'
  }));

  // Extract webpack runtime & manifest
  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity,
    filename: this.options.build.filenames.manifest
  }));

  // Define Env
  config.plugins.push(new webpack.DefinePlugin(Object.assign(env, {
    'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || (this.options.dev ? 'development' : 'production')),
    'process.env.VUE_ENV': JSON.stringify('client'),
    'process.mode': JSON.stringify(this.options.mode),
    'process.browser': true,
    'process.client': true,
    'process.server': false,
    'process.static': this.isStatic
  })));

  // Build progress bar
  config.plugins.push(new ProgressBarPlugin());

  // --------------------------------------
  // Dev specific config
  // --------------------------------------
  if (this.options.dev) {
    // Add friendly error plugin
    config.plugins.push(new FriendlyErrorsWebpackPlugin());

    // https://webpack.js.org/plugins/named-modules-plugin
    config.plugins.push(new webpack.NamedModulesPlugin());

    // Add HMR support
    config.entry.app = [
    // https://github.com/glenjamin/webpack-hot-middleware#config
    `webpack-hot-middleware/client?name=client&reload=true&timeout=30000&path=${this.options.router.base}/__webpack_hmr`.replace(/\/\//g, '/'), config.entry.app];
    config.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin());

    // DllReferencePlugin
    // https://github.com/webpack/webpack/tree/master/examples/dll-user
    if (this.options.build.dll) {
      const _dlls = [];
      const vendorEntries = this.vendorEntries();
      const dllDir = path.resolve(this.options.cacheDir, config.name + '-dll');
      Object.keys(vendorEntries).forEach(v => {
        const dllManifestFile = path.resolve(dllDir, v + '-manifest.json');
        if (fs.existsSync(dllManifestFile)) {
          _dlls.push(v);
          config.plugins.push(new webpack.DllReferencePlugin({
            // context: this.options.rootDir,
            manifest: dllManifestFile // Using full path to allow finding .js dll file
          }));
        }
      });
      if (_dlls.length) {
        debug$5('Using dll for ' + _dlls.join(','));
      }
    }
  }

  // --------------------------------------
  // Production specific config
  // --------------------------------------
  if (!this.options.dev) {
    // Scope Hoisting
    config.plugins.push();

    // https://webpack.js.org/plugins/hashed-module-ids-plugin
    config.plugins.push(new webpack.HashedModuleIdsPlugin());

    // Minify JS
    // https://github.com/webpack-contrib/uglifyjs-webpack-plugin
    config.plugins.push(new UglifyJSPlugin({
      cache: true,
      sourceMap: true,
      extractComments: {
        filename: 'LICENSES'
      }
    }));

    // Webpack Bundle Analyzer
    if (this.options.build.analyze) {
      config.plugins.push(new webpackBundleAnalyzer.BundleAnalyzerPlugin(Object.assign({}, this.options.build.analyze)));
    }
  }

  // Extend config
  if (typeof this.options.build.extend === 'function') {
    const isDev = this.options.dev;
    const extendedConfig = this.options.build.extend.call(this, config, {
      get dev() {
        console.warn('dev has been deprecated in build.extend(), please use isDev'); // eslint-disable-line no-console
        return isDev;
      },
      isDev,
      isClient: true
    });
    // Only overwrite config when something is returned for backwards compatibility
    if (extendedConfig !== undefined) {
      config = extendedConfig;
    }
  }

  return config;
}

/*
|--------------------------------------------------------------------------
| Webpack Server Config
|--------------------------------------------------------------------------
*/
function webpackServerConfig() {
  let config = webpackBaseConfig.call(this, 'server');

  // env object defined in nuxt.config.js
  let env = {};
  _.each(this.options.env, (value, key) => {
    env['process.env.' + key] = ['boolean', 'number'].indexOf(typeof value) !== -1 ? value : JSON.stringify(value);
  });

  config = Object.assign(config, {
    target: 'node',
    node: false,
    devtool: 'source-map',
    entry: path.resolve(this.options.buildDir, 'server.js'),
    output: Object.assign({}, config.output, {
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2'
    }),
    performance: {
      hints: false,
      maxAssetSize: Infinity
    },
    externals: [],
    plugins: (config.plugins || []).concat([new VueSSRServerPlugin({
      filename: 'server-bundle.json'
    }), new webpack.DefinePlugin(Object.assign(env, {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || (this.options.dev ? 'development' : 'production')),
      'process.env.VUE_ENV': JSON.stringify('server'),
      'process.mode': JSON.stringify(this.options.mode),
      'process.browser': false,
      'process.client': false,
      'process.server': true,
      'process.static': this.isStatic
    }))])
  });

  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  const moduleDirs = [this.options.modulesDir
  // Temporary disabled due to vue-server-renderer module search limitations
  // resolve(__dirname, '..', 'node_modules')
  ];
  moduleDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      config.externals.push(nodeExternals({
        // load non-javascript files with extensions, presumably via loaders
        whitelist: [/es6-promise|\.(?!(?:js|json)$).{1,5}$/i],
        modulesDir: dir
      }));
    }
  });

  // --------------------------------------
  // Production specific config
  // --------------------------------------
  if (typeof this.options.build.extend === 'function') {
    const isDev = this.options.dev;
    const extendedConfig = this.options.build.extend.call(this, config, {
      get dev() {
        console.warn('dev has been deprecated in build.extend(), please use isDev'); // eslint-disable-line no-console
        return isDev;
      },
      isDev,
      isServer: true
    });
    // Only overwrite config when something is returned for backwards compatibility
    if (extendedConfig !== undefined) {
      config = extendedConfig;
    }
  }

  return config;
}

/*
|--------------------------------------------------------------------------
| Webpack Dll Config
| https://github.com/webpack/webpack/tree/master/examples/dll
|--------------------------------------------------------------------------
*/
function webpackDllConfig(_refConfig) {
  const refConfig = _refConfig || new webpackClientConfig();

  const name = refConfig.name + '-dll';
  const dllDir = path.resolve(this.options.cacheDir, name);

  let config = {
    name,
    entry: this.vendorEntries(),
    // context: this.options.rootDir,
    resolve: refConfig.resolve,
    target: refConfig.target,
    resolveLoader: refConfig.resolveLoader,
    module: refConfig.module,
    plugins: []
  };

  config.output = {
    path: dllDir,
    filename: '[name]_[hash].js',
    library: '[name]_[hash]'
  };

  config.plugins.push(new webpack.DllPlugin({
    // The path to the manifest file which maps between
    // modules included in a bundle and the internal IDs
    // within that bundle
    path: path.resolve(dllDir, '[name]-manifest.json'),

    name: '[name]_[hash]'
  }));

  return config;
}

function vueLoader() {
  // https://vue-loader.vuejs.org/en
  const config = {
    postcss: this.options.build.postcss,
    extractCSS: this.options.build.extractCSS,
    cssSourceMap: this.options.build.cssSourceMap,
    preserveWhitespace: false,
    loaders: {
      'js': {
        loader: 'babel-loader',
        options: Object.assign({}, this.babelOptions)
      },
      // Note: do not nest the `postcss` option under `loaders`
      'css': this.styleLoader('css', [], true),
      'less': this.styleLoader('less', 'less-loader', true),
      'scss': this.styleLoader('scss', 'sass-loader', true),
      'sass': this.styleLoader('sass', { loader: 'sass-loader', options: { indentedSyntax: true } }, true),
      'stylus': this.styleLoader('stylus', 'stylus-loader', true),
      'styl': this.styleLoader('stylus', 'stylus-loader', true)
    },
    template: {
      doctype: 'html' // For pug, see https://github.com/vuejs/vue-loader/issues/55
    },
    transformToRequire: {
      video: 'src',
      source: 'src'
    }

    // Return the config
  };return config;
}

function styleLoader(ext, loaders = [], isVueLoader = false) {
  // Normalize loaders
  loaders = (Array.isArray(loaders) ? loaders : [loaders]).map(loader => {
    if (typeof loader === 'string') {
      loader = { loader };
    }
    return Object.assign({
      options: {
        sourceMap: this.options.build.cssSourceMap
      }
    }, loader);
  });

  // https://github.com/postcss/postcss-loader
  let postcssLoader;
  if (!isVueLoader && this.options.build.postcss) {
    postcssLoader = {
      loader: 'postcss-loader',
      options: this.options.build.postcss
    };
  }

  // https://github.com/webpack-contrib/css-loader
  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: true,
      importLoaders: 1,
      sourceMap: this.options.build.cssSourceMap,
      alias: {
        '/static': path.join(this.options.srcDir, 'static'),
        '/assets': path.join(this.options.srcDir, 'assets')
      }
    }

    // https://github.com/vuejs/vue-style-loader
  };const vueStyleLoader = {
    loader: 'vue-style-loader',
    options: {
      sourceMap: this.options.build.cssSourceMap
    }
  };

  if (this.options.build.extractCSS && !this.options.dev) {
    return ExtractTextPlugin.extract({
      fallback: vueStyleLoader,
      use: [cssLoader, postcssLoader, ...loaders].filter(l => l)
    });
  }

  return [vueStyleLoader, cssLoader, postcssLoader, ...loaders].filter(l => l);
}

const debug$4 = Debug('nuxt:build');
debug$4.color = 2; // Force green color

const glob = pify(Glob);

class Builder {
  constructor(nuxt) {
    this.nuxt = nuxt;
    this.isStatic = false; // Flag to know if the build is for a generated app
    this.options = nuxt.options;

    // Fields that set on build
    this.compiler = null;
    this.webpackDevMiddleware = null;
    this.webpackHotMiddleware = null;

    // Mute stats on dev
    this.webpackStats = this.options.dev ? false : {
      chunks: false,
      children: false,
      modules: false,
      colors: true,
      excludeAssets: [/.map$/, /index\..+\.html$/, /vue-ssr-client-manifest.json/]

      // Helper to resolve build paths
    };this.relativeToBuild = (...args) => relativeTo(this.options.buildDir, ...args);

    // Bind styleLoader and vueLoader
    this.styleLoader = styleLoader.bind(this);
    this.vueLoader = vueLoader.bind(this);

    this._buildStatus = STATUS.INITIAL;
  }

  get plugins() {
    return this.options.plugins.map((p, i) => {
      if (typeof p === 'string') p = { src: p };
      return {
        src: this.nuxt.resolvePath(p.src),
        ssr: p.ssr !== false,
        name: path.basename(p.src, path.extname(p.src)).replace(/[^a-zA-Z?\d\s:]/g, '')
      };
    });
  }

  vendor() {
    return ['vue', 'vue-router', 'vue-meta', this.options.store && 'vuex'].concat(this.options.build.vendor).filter(v => v);
  }

  vendorEntries() {
    // Used for dll
    const vendor = this.vendor();
    const vendorEntries = {};
    vendor.forEach(v => {
      try {
        require.resolve(v);
        vendorEntries[v] = [v];
      } catch (e) {
        // Ignore
      }
    });
    return vendorEntries;
  }

  forGenerate() {
    this.isStatic = true;
  }

  build() {
    var _this = this;

    return asyncToGenerator(function* () {
      // Avoid calling build() method multiple times when dev:true
      /* istanbul ignore if */
      if (_this._buildStatus === STATUS.BUILD_DONE && _this.options.dev) {
        return _this;
      }
      // If building
      /* istanbul ignore if */
      if (_this._buildStatus === STATUS.BUILDING) {
        return new Promise(function (resolve$$1) {
          setTimeout(function () {
            resolve$$1(_this.build());
          }, 1000);
        });
      }
      _this._buildStatus = STATUS.BUILDING;

      // Wait for nuxt ready
      yield _this.nuxt.ready();

      // Call before hook
      yield _this.nuxt.callHook('build:before', _this, _this.options.build);

      // Babel options
      _this.babelOptions = ___default.defaults(_this.options.build.babel, {
        babelrc: false,
        cacheDirectory: !!_this.options.dev
      });
      if (!_this.babelOptions.babelrc && !_this.babelOptions.presets) {
        _this.babelOptions.presets = [[require.resolve('babel-preset-vue-app'), {
          targets: { ie: 9, uglify: true }
        }]];
      }

      // Map postcss plugins into instances on object mode once
      if (isPureObject(_this.options.build.postcss)) {
        if (isPureObject(_this.options.build.postcss.plugins)) {
          _this.options.build.postcss.plugins = Object.keys(_this.options.build.postcss.plugins).map(function (p) {
            const plugin = require(_this.nuxt.resolvePath(p));
            const opts = _this.options.build.postcss.plugins[p];
            if (opts === false) return; // Disabled
            const instance = plugin(opts);
            return instance;
          }).filter(function (e) {
            return e;
          });
        }
      }

      // Check if pages dir exists and warn if not
      _this._nuxtPages = typeof _this.options.build.createRoutes !== 'function';
      if (_this._nuxtPages) {
        if (!fs$1__default.existsSync(path.join(_this.options.srcDir, 'pages'))) {
          let dir = _this.options.srcDir;
          if (fs$1__default.existsSync(path.join(_this.options.srcDir, '..', 'pages'))) {
            throw new Error(`No \`pages\` directory found in ${dir}. Did you mean to run \`nuxt\` in the parent (\`../\`) directory?`);
          } else {
            throw new Error(`Couldn't find a \`pages\` directory in ${dir}. Please create one under the project root`);
          }
        }
      }

      debug$4(`App root: ${_this.options.srcDir}`);
      debug$4(`Generating ${_this.options.buildDir} files...`);

      // Create .nuxt/, .nuxt/components and .nuxt/dist folders
      yield fs$1.remove(r(_this.options.buildDir));
      yield fs$1.mkdirp(r(_this.options.buildDir, 'components'));
      if (!_this.options.dev) {
        yield fs$1.mkdirp(r(_this.options.buildDir, 'dist'));
      }

      // Generate routes and interpret the template files
      yield _this.generateRoutesAndFiles();

      // Start webpack build
      yield _this.webpackBuild();

      // Flag to set that building is done
      _this._buildStatus = STATUS.BUILD_DONE;

      // Call done hook
      yield _this.nuxt.callHook('build:done', _this);

      return _this;
    })();
  }

  generateRoutesAndFiles() {
    var _this2 = this;

    return asyncToGenerator(function* () {
      debug$4('Generating files...');
      // -- Templates --
      let templatesFiles = ['App.js', 'client.js', 'index.js', 'middleware.js', 'router.js', 'server.js', 'utils.js', 'empty.js', 'components/nuxt-error.vue', 'components/nuxt-loading.vue', 'components/nuxt-child.js', 'components/nuxt-link.js', 'components/nuxt.js', 'components/no-ssr.js', 'views/app.template.html', 'views/error.html'];
      const templateVars = {
        options: _this2.options,
        messages: _this2.options.messages,
        uniqBy: ___default.uniqBy,
        isDev: _this2.options.dev,
        debug: _this2.options.debug,
        mode: _this2.options.mode,
        router: _this2.options.router,
        env: _this2.options.env,
        head: _this2.options.head,
        middleware: fs$1__default.existsSync(path.join(_this2.options.srcDir, 'middleware')),
        store: _this2.options.store,
        css: _this2.options.css,
        plugins: _this2.plugins,
        appPath: './App.js',
        layouts: Object.assign({}, _this2.options.layouts),
        loading: typeof _this2.options.loading === 'string' ? _this2.relativeToBuild(_this2.options.srcDir, _this2.options.loading) : _this2.options.loading,
        transition: _this2.options.transition,
        layoutTransition: _this2.options.layoutTransition,
        components: {
          ErrorPage: _this2.options.ErrorPage ? _this2.relativeToBuild(_this2.options.ErrorPage) : null
        }

        // -- Layouts --
      };if (fs$1__default.existsSync(path.resolve(_this2.options.srcDir, 'layouts'))) {
        const layoutsFiles = yield glob('layouts/**/*.vue', { cwd: _this2.options.srcDir });
        let hasErrorLayout = false;
        layoutsFiles.forEach(function (file) {
          let name = file.split('/').slice(1).join('/').replace(/\.vue$/, '');
          if (name === 'error') {
            hasErrorLayout = true;
            return;
          }
          templateVars.layouts[name] = _this2.relativeToBuild(_this2.options.srcDir, file);
        });
        if (!templateVars.components.ErrorPage && hasErrorLayout) {
          templateVars.components.ErrorPage = _this2.relativeToBuild(_this2.options.srcDir, 'layouts/error.vue');
        }
      }
      // If no default layout, create its folder and add the default folder
      if (!templateVars.layouts.default) {
        yield fs$1.mkdirp(r(_this2.options.buildDir, 'layouts'));
        templatesFiles.push('layouts/default.vue');
        templateVars.layouts.default = './layouts/default.vue';
      }

      // -- Routes --
      debug$4('Generating routes...');
      // If user defined a custom method to create routes
      if (_this2._nuxtPages) {
        // Use nuxt.js createRoutes bases on pages/
        const files = yield glob('pages/**/*.vue', { cwd: _this2.options.srcDir });
        templateVars.router.routes = createRoutes(files, _this2.options.srcDir);
      } else {
        templateVars.router.routes = _this2.options.build.createRoutes(_this2.options.srcDir);
      }

      yield _this2.nuxt.callHook('build:extendRoutes', templateVars.router.routes, r);

      // router.extendRoutes method
      if (typeof _this2.options.router.extendRoutes === 'function') {
        // let the user extend the routes
        const extendedRoutes = _this2.options.router.extendRoutes(templateVars.router.routes, r);
        // Only overwrite routes when something is returned for backwards compatibility
        if (extendedRoutes !== undefined) {
          templateVars.router.routes = extendedRoutes;
        }
      }

      // Make routes accessible for other modules and webpack configs
      _this2.routes = templateVars.router.routes;

      // -- Store --
      // Add store if needed
      if (_this2.options.store) {
        templatesFiles.push('store.js');
      }

      // Resolve template files
      const customTemplateFiles = _this2.options.build.templates.map(function (t) {
        return t.dst || path.basename(t.src || t);
      });

      templatesFiles = templatesFiles.map(function (file) {
        // Skip if custom file was already provided in build.templates[]
        if (customTemplateFiles.indexOf(file) !== -1) {
          return;
        }
        // Allow override templates using a file with same name in ${srcDir}/app
        const customPath = r(_this2.options.srcDir, 'app', file);
        const customFileExists = fs$1__default.existsSync(customPath);

        return {
          src: customFileExists ? customPath : r(_this2.options.nuxtAppDir, file),
          dst: file,
          custom: customFileExists
        };
      }).filter(function (i) {
        return !!i;
      });

      // -- Custom templates --
      // Add custom template files
      templatesFiles = templatesFiles.concat(_this2.options.build.templates.map(function (t) {
        return Object.assign({
          src: r(_this2.options.srcDir, t.src || t),
          dst: t.dst || path.basename(t.src || t),
          custom: true
        }, t);
      }));

      // -- Loading indicator --
      if (_this2.options.loadingIndicator.name) {
        const indicatorPath1 = path.resolve(_this2.options.nuxtAppDir, 'views/loading', _this2.options.loadingIndicator.name + '.html');
        const indicatorPath2 = _this2.nuxt.resolvePath(_this2.options.loadingIndicator.name);
        const indicatorPath = fs$1.existsSync(indicatorPath1) ? indicatorPath1 : fs$1.existsSync(indicatorPath2) ? indicatorPath2 : null;
        if (indicatorPath) {
          templatesFiles.push({
            src: indicatorPath,
            dst: 'loading.html',
            options: _this2.options.loadingIndicator
          });
        } else {
          console.error(`Could not fetch loading indicator: ${_this2.options.loadingIndicator.name}`); // eslint-disable-line no-console
        }
      }

      yield _this2.nuxt.callHook('build:templates', { templatesFiles, templateVars, resolve: r });

      // Interpret and move template files to .nuxt/
      yield Promise.all(templatesFiles.map((() => {
        var _ref = asyncToGenerator(function* ({ src, dst, options, custom }) {
          // Add template to watchers
          _this2.options.build.watch.push(src);
          // Render template to dst
          const fileContent = yield fs$1.readFile(src, 'utf8');
          let content;
          try {
            const template = ___default.template(fileContent, {
              imports: {
                serialize,
                hash,
                r,
                wp,
                wChunk,
                resolvePath: _this2.nuxt.resolvePath.bind(_this2.nuxt),
                relativeToBuild: _this2.relativeToBuild
              }
            });
            content = template(Object.assign({}, templateVars, {
              options: options || {},
              custom,
              src,
              dst
            }));
          } catch (err) {
            throw new Error(`Could not compile template ${src}: ${err.message}`);
          }
          const path$$1 = r(_this2.options.buildDir, dst);
          // Ensure parent dir exits
          yield fs$1.mkdirp(path.dirname(path$$1));
          // Write file
          yield fs$1.writeFile(path$$1, content, 'utf8');
          // Fix webpack loop (https://github.com/webpack/watchpack/issues/25#issuecomment-287789288)
          const dateFS = Date.now() / 1000 - 1000;
          return fs$1.utimes(path$$1, dateFS, dateFS);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()));
    })();
  }

  webpackBuild() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      debug$4('Building files...');
      const compilersOptions = [];

      // Client
      const clientConfig = webpackClientConfig.call(_this3);
      compilersOptions.push(clientConfig);

      // Server
      let serverConfig = null;
      if (_this3.options.build.ssr) {
        serverConfig = webpackServerConfig.call(_this3);
        compilersOptions.push(serverConfig);
      }

      // Alias plugins to their real path
      _this3.plugins.forEach(function (p) {
        const src = _this3.relativeToBuild(p.src);

        // Client config
        if (!clientConfig.resolve.alias[p.name]) {
          clientConfig.resolve.alias[p.name] = src;
        }

        // Server config
        if (serverConfig && !serverConfig.resolve.alias[p.name]) {
          // Alias to noop for ssr:false plugins
          serverConfig.resolve.alias[p.name] = p.ssr ? src : './empty.js';
        }
      });

      // Make a dll plugin after compile to make nuxt dev builds faster
      if (_this3.options.build.dll && _this3.options.dev) {
        compilersOptions.push(webpackDllConfig.call(_this3, clientConfig));
      }

      // Simulate webpack multi compiler interface
      // Separate compilers are simpler, safer and faster
      _this3.compilers = [];

      // Initialize shared FS and Cache
      const sharedFS = _this3.options.dev && new MFS();
      const sharedCache = {};

      // Initialize compilers
      compilersOptions.forEach(function (compilersOption) {
        const compiler = webpack(compilersOption);
        // In dev, write files in memory FS (except for DLL)
        if (sharedFS && !(compiler.name.indexOf('-dll') !== -1)) {
          compiler.outputFileSystem = sharedFS;
        }
        compiler.cache = sharedCache;
        _this3.compilers.push(compiler);
      });

      // Start Builds
      yield sequence(_this3.compilers, function (compiler) {
        return new Promise((() => {
          var _ref2 = asyncToGenerator(function* (resolve$$1, reject) {
            const name = compiler.options.name;
            yield _this3.nuxt.callHook('build:compile', { name, compiler });

            // Resolve only when compiler emit done event
            compiler.plugin('done', (() => {
              var _ref3 = asyncToGenerator(function* (stats) {
                yield _this3.nuxt.callHook('build:compiled', { name, compiler, stats });
                // Reload renderer if available
                _this3.nuxt.renderer.loadResources(sharedFS || fs$1__default);
                // Resolve on next tick
                process.nextTick(resolve$$1);
              });

              return function (_x4) {
                return _ref3.apply(this, arguments);
              };
            })());
            // --- Dev Build ---
            if (_this3.options.dev) {
              // Client Build, watch is started by dev-middleware
              if (compiler.options.name === 'client') {
                return _this3.webpackDev(compiler);
              }
              // DLL build, should run only once
              if (compiler.options.name.indexOf('-dll') !== -1) {
                compiler.run(function (err, stats) {
                  if (err) return reject(err);
                  debug$4('[DLL] updated');
                });
                return;
              }
              // Server, build and watch for changes
              compiler.watch(_this3.options.watchers.webpack, function (err) {
                /* istanbul ignore if */
                if (err) return reject(err);
              });
              return;
            }
            // --- Production Build ---
            compiler.run(function (err, stats) {
              /* istanbul ignore if */
              if (err) {
                console.error(err); // eslint-disable-line no-console
                return reject(err);
              }

              // Show build stats for production
              console.log(stats.toString(_this3.webpackStats)); // eslint-disable-line no-console

              /* istanbul ignore if */
              if (stats.hasErrors()) {
                return reject(new Error('Webpack build exited with errors'));
              }
            });
          });

          return function (_x2, _x3) {
            return _ref2.apply(this, arguments);
          };
        })());
      });
    })();
  }

  webpackDev(compiler) {
    debug$4('Adding webpack middleware...');

    // Create webpack dev middleware
    this.webpackDevMiddleware = pify(webpackDevMiddleware(compiler, Object.assign({
      publicPath: this.options.build.publicPath,
      stats: this.webpackStats,
      noInfo: true,
      quiet: true,
      watchOptions: this.options.watchers.webpack
    }, this.options.build.devMiddleware)));

    this.webpackHotMiddleware = pify(webpackHotMiddleware(compiler, Object.assign({
      log: false,
      heartbeat: 10000
    }, this.options.build.hotMiddleware)));

    // Inject to renderer instance
    if (this.nuxt.renderer) {
      this.nuxt.renderer.webpackDevMiddleware = this.webpackDevMiddleware;
      this.nuxt.renderer.webpackHotMiddleware = this.webpackHotMiddleware;
    }

    // Stop webpack middleware on nuxt.close()
    this.nuxt.hook('close', () => new Promise(resolve$$1 => {
      this.webpackDevMiddleware.close(() => resolve$$1());
    }));

    // Start watching files
    this.watchFiles();
  }

  watchFiles() {
    const patterns = [r(this.options.srcDir, 'layouts'), r(this.options.srcDir, 'store'), r(this.options.srcDir, 'middleware'), r(this.options.srcDir, 'layouts/*.vue'), r(this.options.srcDir, 'layouts/**/*.vue')];
    if (this._nuxtPages) {
      patterns.push(r(this.options.srcDir, 'pages'));
      patterns.push(r(this.options.srcDir, 'pages/*.vue'));
      patterns.push(r(this.options.srcDir, 'pages/**/*.vue'));
    }
    const options = Object.assign({}, this.options.watchers.chokidar, {
      ignoreInitial: true
    });
    /* istanbul ignore next */
    const refreshFiles = ___default.debounce(() => this.generateRoutesAndFiles(), 200);

    // Watch for src Files
    let filesWatcher = chokidar.watch(patterns, options).on('add', refreshFiles).on('unlink', refreshFiles);

    // Watch for custom provided files
    let customFilesWatcher = chokidar.watch(___default.uniq(this.options.build.watch), options).on('change', refreshFiles);

    // Stop watching on nuxt.close()
    this.nuxt.hook('close', () => {
      filesWatcher.close();
      customFilesWatcher.close();
    });
  }
}

const STATUS = {
  INITIAL: 1,
  BUILD_DONE: 2,
  BUILDING: 3
};

const debug$6 = Debug('nuxt:generate');

class Generator {
  constructor(nuxt, builder) {
    this.nuxt = nuxt;
    this.options = nuxt.options;
    this.builder = builder;

    // Set variables
    this.generateRoutes = path.resolve(this.options.srcDir, 'static');
    this.srcBuiltPath = path.resolve(this.options.buildDir, 'dist');
    this.distPath = path.resolve(this.options.rootDir, this.options.generate.dir);
    this.distNuxtPath = path.join(this.distPath, isUrl(this.options.build.publicPath) ? '' : this.options.build.publicPath);
  }

  generate({ build = true, init = true } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      // Wait for nuxt be ready
      yield _this.nuxt.ready();

      // Call before hook
      yield _this.nuxt.callHook('generate:before', _this, _this.options.generate);

      const s = Date.now();
      let errors = [];

      // Add flag to set process.static
      _this.builder.forGenerate();

      // Start build process
      if (build) {
        yield _this.builder.build();
      }

      // Initialize dist directory
      if (init) {
        yield _this.initDist();
      }

      // Resolve config.generate.routes promises before generating the routes
      let generateRoutes = [];
      if (_this.options.router.mode !== 'hash') {
        try {
          generateRoutes = yield promisifyRoute(_this.options.generate.routes || []);
        } catch (e) {
          console.error('Could not resolve routes'); // eslint-disable-line no-console
          throw e; // eslint-disable-line no-unreachable
        }
      }

      // Generate only index.html for router.mode = 'hash'
      let routes = _this.options.router.mode === 'hash' ? ['/'] : flatRoutes(_this.options.router.routes);
      routes = _this.decorateWithPayloads(routes, generateRoutes);

      // extendRoutes hook
      yield _this.nuxt.callHook('generate:extendRoutes', routes);

      // Start generate process
      while (routes.length) {
        let n = 0;
        yield Promise.all(routes.splice(0, _this.options.generate.concurrency).map((() => {
          var _ref = asyncToGenerator(function* ({ route, payload }) {
            yield waitFor(n++ * _this.options.generate.interval);
            yield _this.generateRoute({ route, payload, errors });
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()));
      }

      const indexPath = path.join(_this.distPath, 'index.html');
      if (fs$1.existsSync(indexPath)) {
        // Copy /index.html to /200.html for surge SPA
        // https://surge.sh/help/adding-a-200-page-for-client-side-routing
        const _200Path = path.join(_this.distPath, '200.html');
        if (!fs$1.existsSync(_200Path)) {
          yield fs$1.copy(indexPath, _200Path);
        }
      }

      const duration = Math.round((Date.now() - s) / 100) / 10;
      debug$6(`HTML Files generated in ${duration}s`);

      // done hook
      yield _this.nuxt.callHook('generate:done', _this, errors);

      if (errors.length) {
        const report = errors.map(function ({ type, route, error }) {
          /* istanbul ignore if */
          if (type === 'unhandled') {
            return `Route: '${route}'\n${error.stack}`;
          } else {
            return `Route: '${route}' thrown an error: \n` + JSON.stringify(error);
          }
        });
        console.error('==== Error report ==== \n' + report.join('\n\n')); // eslint-disable-line no-console
      }

      return { duration, errors };
    })();
  }

  initDist() {
    var _this2 = this;

    return asyncToGenerator(function* () {
      // Clean destination folder
      yield fs$1.remove(_this2.distPath);
      debug$6('Destination folder cleaned');

      // Copy static and built files
      /* istanbul ignore if */
      if (fs$1.existsSync(_this2.generateRoutes)) {
        yield fs$1.copy(_this2.generateRoutes, _this2.distPath);
      }
      yield fs$1.copy(_this2.srcBuiltPath, _this2.distNuxtPath);

      // Add .nojekyll file to let Github Pages add the _nuxt/ folder
      // https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/
      const nojekyllPath = path.resolve(_this2.distPath, '.nojekyll');
      fs$1.writeFile(nojekyllPath, '');

      // Cleanup SSR related files
      const extraFiles = ['index.spa.html', 'index.ssr.html', 'server-bundle.json', 'vue-ssr-client-manifest.json'].map(function (file) {
        return path.resolve(_this2.distNuxtPath, file);
      });

      extraFiles.forEach(function (file) {
        if (fs$1.existsSync(file)) {
          fs$1.removeSync(file);
        }
      });

      debug$6('Static & build files copied');
    })();
  }

  decorateWithPayloads(routes, generateRoutes) {
    let routeMap = {};
    // Fill routeMap for known routes
    routes.forEach(route => {
      routeMap[route] = {
        route,
        payload: null
      };
    });
    // Fill routeMap with given generate.routes
    generateRoutes.forEach(route => {
      // route is either a string or like { route : '/my_route/1', payload: {} }
      const path$$1 = ___default.isString(route) ? route : route.route;
      routeMap[path$$1] = {
        route: path$$1,
        payload: route.payload || null
      };
    });
    return ___default.values(routeMap);
  }

  generateRoute({ route, payload = {}, errors = [] }) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      let html;

      try {
        const res = yield _this3.nuxt.renderer.renderRoute(route, { _generate: true, payload });
        html = res.html;
        if (res.error) {
          errors.push({ type: 'handled', route, error: res.error });
        }
      } catch (err) {
        /* istanbul ignore next */
        return errors.push({ type: 'unhandled', route, error: err });
      }

      if (_this3.options.generate.minify) {
        try {
          html = htmlMinifier.minify(html, _this3.options.generate.minify);
        } catch (err) /* istanbul ignore next */{
          const minifyErr = new Error(`HTML minification failed. Make sure the route generates valid HTML. Failed HTML:\n ${html}`);
          errors.push({ type: 'unhandled', route, error: minifyErr });
        }
      }

      let path$$1 = path.join(route, path.sep, 'index.html'); // /about -> /about/index.html
      path$$1 = path$$1 === '/404/index.html' ? '/404.html' : path$$1; // /404 -> /404.html

      // Call hook to let user update the path & html
      const page = { route, path: path$$1, html };
      yield _this3.nuxt.callHook('generate:page', page);

      debug$6('Generate file: ' + page.path);
      page.path = path.join(_this3.distPath, page.path);

      // Make sure the sub folders are created
      yield fs$1.mkdirp(path.dirname(page.path));
      yield fs$1.writeFile(page.path, page.html, 'utf8');

      return true;
    })();
  }
}



var builder = Object.freeze({
	Builder: Builder,
	Generator: Generator
});

var index = Object.assign({}, core, builder);

module.exports = index;
//# sourceMappingURL=nuxt.js.map
