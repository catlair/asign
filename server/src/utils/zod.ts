import i18next from 'i18next'
import { z } from 'zod'
// zod-i18n 在 esm 中存在 bug
// https://stackoverflow.com/questions/76912272/why-is-the-zod-error-message-undefined-when-using-zod-i18n-in-server-side-code/77108389#77108389
import { zodI18nMap } from 'zod-i18n-map/dist/index.mjs'
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'
import { fromError } from 'zod-validation-error'

// lng and resources key depend on your locale.
i18next.init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': { zod: translation },
  },
})
z.setErrorMap(zodI18nMap)

export function zFromError({ error }: { error: unknown }) {
  return fromError(error).toString()
}

export { z }
