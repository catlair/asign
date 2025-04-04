import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { AppSidebar } from './components/sidebar-menu'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'

import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from '@kobalte/core'
import { isServer } from 'solid-js/web'
import { getCookie } from 'vinxi/http'
import { ModeToggle } from './components/mode-toggle'

function getServerCookies() {
  'use server'
  const colorMode = getCookie('kb-color-mode')
  return colorMode ? `kb-color-mode=${colorMode}` : ''
}

export default function App() {
  const storageManager = cookieStorageManagerSSR(
    isServer ? getServerCookies() : document.cookie,
  )

  return (
    <Router
      root={(props) => (
        <>
          <ColorModeScript storageType={storageManager.type} />
          <ColorModeProvider storageManager={storageManager}>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header class='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                  <SidebarTrigger class='-ml-1' />
                  <ModeToggle class='ml-auto' />
                </header>
                <Suspense>{props.children}</Suspense>
              </SidebarInset>
            </SidebarProvider>
          </ColorModeProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
