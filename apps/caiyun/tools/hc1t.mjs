import { loadConfig, pushMessage, runHc1t, sleep } from './caiyun.mjs'

const { config, message } = await loadConfig()

// 如果需要发送消息
const pushData = []

for (const conf of config) {
  await runHc1t(conf, pushData)
}

await sleep(5000)

// 再执行一次使用邀请后增加的机会
for (const conf of config) {
  await runHc1t(conf, pushData)
}

// await sleep(5000)

// 可以多执行几次避免漏掉被邀请后增加的机会
// 如果是和别人约定的邀请，而不自己执行几个账号，那么可能需要在不同的时间节点运行，这个就需要自行约定了
// 确保被邀请后再次执行即可
// 注意配置中配置的是你需要邀请的账号，是你去邀请被人，邀请成功是给别人增加次数。

// 请主动去阅读云朵大作战的说明，避免错误操作
// 例如排名档次为 100 500 1000
// 通常情况下排名 500 可以不兑换次数，如果你配置了目标排名 200，且开启兑换，那么你将消耗一定数量的云朵来获取本应该白嫖的 500 档

// for (const conf of config) {
//   await runHc1t(conf, pushData)
// }

// 如果需要发送消息
// await pushMessage({ pushData, message })

// 配置示例
// {
//   caiyun:[
//     {
//       auth: 'xxxx',
//       云朵大作战: {
//         邀请用户: [ "199xxxx6666", "127****0001" ],
//         目标排名: 500,
//         开启兑换: false
//       }
//     }
//   ]
// }
