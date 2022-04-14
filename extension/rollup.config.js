import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'scripts/background-script.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    name: 'mybundle'
  },
  plugins: [nodeResolve({
    browser: true,
  }), commonjs(), nodePolyfills()]
};
