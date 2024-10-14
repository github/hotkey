import pkg from './package.json' with {type: 'json'}

export default [
  {
    input: 'dist/index.js',
    output: [{file: pkg['module'], format: 'es'}]
  }
]
