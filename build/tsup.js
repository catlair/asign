import { replace } from 'esbuild-plugin-replace'
import { defineConfig } from 'tsup'

/**
 * @param {string} version
 */
export function setVersion(version) {
  return replace({
    __ASIGN_VERSION__: version,
  })
}

/**
 * @param {import('esbuild').BuildOptions} options
 */
function setEsbuildOptions(options) {
  options.charset = 'utf8'
}

export const tsupDefuConfig = defineConfig({
  clean: true,
  platform: 'node',
  splitting: true,
  minify: false,
  target: 'node18',
  shims: true,
  dts: true,
  minifySyntax: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'cjs' : format === 'esm' ? 'mjs' : 'js'}`,
    }
  },
  esbuildOptions: (options) => {
    setEsbuildOptions(options)
  },
})

export const appDefuConfig = defineConfig({
  ...tsupDefuConfig,
  format: ['cjs', 'esm'],
  esbuildOptions: (options) => {
    setEsbuildOptions(options)
    // 判断是否是 esm，避免重复引入 require
    if (options.define?.['TSUP_FORMAT'] === '"esm"') {
      options.banner = {
        js:
          `import{createRequire}from'module';if(!globalThis.require)globalThis.require=createRequire(import.meta.url);`,
      }
    }
  },
})

export const cliDefuConfig = defineConfig({
  ...appDefuConfig,
  entry: ['cli.ts'],
  outExtension() {
    return {
      js: '.js',
    }
  },
  format: 'cjs',
  dts: false,
  external: ['./index.js'],
})

export const qlDefuConfig = defineConfig({
  ...appDefuConfig,
  entry: ['qinglong.ts'],
  minify: true,
  outDir: 'out',
  splitting: false,
  dts: false,
  clean: true,
  format: ['esm'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.ql.mjs' : '.ql.js',
    }
  },
})
