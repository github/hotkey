module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      {pattern: 'dist/index.js', type: 'module'},
      {pattern: 'test/test.js', type: 'module'},
      {pattern: 'test/test-radix-trie.js', type: 'module'}
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  })
}
