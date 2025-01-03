// 注意自己设置运行时间为 兑换时间的前一分钟，如 16 点的就是 15:59
import { loadConfig, useExchange } from './caiyun.mjs'

const { config, message } = await loadConfig('../asign.config.js')

// 使用配置中的第一个账号
const { exchange, waitToNextHour, sendMessage } = await useExchange(
  config[1],
  message,
)

waitToNextHour()

// 用网易云举例，此处为 id 数组（可多个）
await exchange([231228018])

// 快速兑换，如果需要自定义逻辑，可以使用这个 api，在兑换前不会有校验
// await exchangeQuickly(231228018, '这是网易云')

// 发送推送，如果兑换成功默认发送一次
// await sendMessage()
