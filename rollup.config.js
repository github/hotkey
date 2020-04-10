/* @flow strict */

import babel from 'rollup-plugin-babel'

const pkg = require('./package.json')

export default [
  {
    input: 'src/index.js',
    output: [{file: pkg['module'], format: 'es'}],
    plugins: [
      babel({
        plugins: ['@babel/plugin-proposal-class-properties'],
        presets: ['@babel/preset-flow']
      })
    ]
  },
  {
    input: 'src/index.js',
    output: [{file: pkg['main'], format: 'umd', name: 'hotkey'}],
    plugins: [
      babel({
        plugins: ['@babel/plugin-proposal-class-properties'],
        presets: ['@babel/preset-env', '@babel/preset-flow']
      })
    ]
  }
]
