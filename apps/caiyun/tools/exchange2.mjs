// 这是多个账号的版本
// 注意自己设置运行时间为 兑换时间的前一分钟，如 16 点的就是 15:59

import { loadConfig, useMultiExchange } from './caiyun.mjs'

const { config, message } = await loadConfig()

const users = [
  {
    // 账号
    user: config[0],
    // 需要兑换的内容
    ids: [231228018, 231228015],
  },
  {
    // 账号
    user: config[1],
    // 需要兑换的内容
    ids: [231228018],
  },
]

// 当然如果所有账号都一样，你可以直接

// const users = config.map(user => ({ user, ids: [231228018, 231228015] }))

await useMultiExchange(users, message, {
  // 同步异步？默认同步，异步可能导致登陆风控而失败
  isAsync: false,
  // 同步时间隔时间 ms
  delay: 1000,
})
