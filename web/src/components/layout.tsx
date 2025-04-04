import { ParentProps } from 'solid-js'
import { AppSidebar } from '~/components/sidebar-menu'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'

export default function Layout(props: ParentProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {props.children}
      </main>
    </SidebarProvider>
  )
}
