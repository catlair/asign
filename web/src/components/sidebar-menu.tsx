import { A } from '@solidjs/router'
import { For } from 'solid-js'

import { IconHome, IconSettings, IconTimer, IconUsers } from '~/components/icons'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'

const items = [
  {
    title: 'Home',
    url: '#',
    icon: IconHome,
  },
  {
    title: '用户管理',
    url: '/users',
    icon: IconUsers,
  },
  {
    title: '定时任务',
    url: '/crons',
    icon: IconTimer,
  },
  {
    title: '设置',
    url: '#',
    icon: IconSettings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <For each={items}>
                {(item) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton as={A} href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
