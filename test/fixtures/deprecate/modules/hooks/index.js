module.exports = function () {
  // Note: Plugin is deprecated. Please use new hooks system.
  this.nuxt.plugin('built', (builder) => {
    this.nuxt.__builder_plugin = true
  })
}
