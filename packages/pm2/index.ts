import pm2 from 'pm2'
import { $ } from 'zx'

export async function ls() {
  return await $`pm2 ls`
}

/**
 * pm2 定时
 */
export async function schedule() {
  return pm2.start({
    autostart: false,
    script: './schedule.mjs',
    cron: '49 12 * * *',
    autorestart: false,
  }, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log('定时任务启动成功')
      pm2.list((err, list) => {
        if (err) {
          console.error(err)
        } else {
          console.log('当前进程列表：')
          console.table(list)
        }
      })
    }
  })
}
