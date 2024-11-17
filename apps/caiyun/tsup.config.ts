import { appDefuConfig, cliDefuConfig, qlDefuConfig, setVersion } from '@asign/build/tsup'
import { defineConfig } from 'tsup'
import { dependencies, devDependencies } from './package.json'

export default defineConfig([
  {
    ...appDefuConfig,
    entry: ['index.ts'],
    external: Object.keys(dependencies),
    esbuildPlugins: [
      setVersion(require('./package.json').version),
    ],
  },
  {
    entry: ['cli.ts'],
    ...cliDefuConfig,
  },
  {
    entry: ['cli2.ts'],
    ...appDefuConfig,
    target: 'node18',
    outExtension() {
      return {
        js: '.js',
      }
    },
    format: 'esm',
    dts: false,
    external: Object.keys(dependencies),
  },
  {
    ...qlDefuConfig,
    entry: ['index.ts'],
    noExternal: Object.keys(dependencies),
    esbuildPlugins: [
      setVersion(require('./package.json').version),
    ],
  },
])
