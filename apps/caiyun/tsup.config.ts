import { appDefuConfig, cliDefuConfig, qlDefuConfig, setVersion } from '@asign/build/tsup'
import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

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
    ...qlDefuConfig,
    entry: ['index.ts'],
    noExternal: Object.keys(dependencies),
    esbuildPlugins: [
      setVersion(require('./package.json').version),
    ],
  },
])
