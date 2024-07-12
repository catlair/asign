import Giscus from '@giscus/solid'
import { createEffect, createSignal } from 'solid-js'

const id = 'inject-comments'

function getCurrentTheme() {
  const theme = document.firstElementChild
    && document.firstElementChild.getAttribute('data-theme')
  return theme || 'light'
}

const Comments = () => {
  const [mounted, setMounted] = createSignal(false)
  const [theme, setTheme] = createSignal('light')

  createEffect(() => {
    const theme = getCurrentTheme()
    setTheme(theme)
    // 监听主题变化
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    // 取消监听
    return () => {
      observer.disconnect()
    }
  }, [])

  createEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div id={id} class='w-full'>
      {mounted()
        ? (
          <div class='comments-container giscus'>
            <Giscus
              id={id}
              repo='asunajs/docs'
              repoId='R_kgDOL2pMgQ'
              category='Announcements'
              categoryId='DIC_kwDOL2pMgc4CfHTT'
              mapping='pathname'
              strict='0'
              reactionsEnabled='1'
              emitMetadata='0'
              inputPosition='top'
              theme={theme()}
              lang='zh-CN'
              loading='lazy'
            />
          </div>
        )
        : null}
    </div>
  )
}

export default Comments
