// https://vitepress.dev/guide/custom-theme
import { NButton, NForm, NFormItem, NInput, NInputNumber } from 'naive-ui'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style/tailwind.css'
import './style/index.css'

import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  async enhanceApp({ app, router, siteData }) {
    // 加载全局组件
    const modules = import.meta.glob('../components/global/**/*.vue')
    for (const path in modules) {
      const mod = await modules[path]()
      if (mod.default) {
        app.component(path.split('/').pop()?.split('.')[0]!, mod.default)
      }
    }

    app.component('NInput', NInput)
    app.component('NInputNumber', NInputNumber)
    app.component('NButton', NButton)
    app.component('NForm', NForm)
    app.component('NFormItem', NFormItem)
  },
} satisfies Theme
