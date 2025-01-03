#!/usr/bin/env node

import type { M } from '@asign/caiyun-core'
import { getCloudDayList, receiveCloudDayGift, verifyCloudDay } from '@asign/caiyun-core/service'
import {
  checkExchange,
  exchangeApi,
  getExchangeList,
  getReceivePrizeDetails,
  getSmsVerCode,
} from '@asign/caiyun-core/service/exchange.js'
import { getAuthInfo, hidePhone } from '@asign/utils-pure'
import { rewriteConfigSync } from '@asunajs/conf'
import { type ConsolaInstance, createLogger, formatTime, waitToNextHour } from '@asunajs/utils'
import { type ArgsDef, defineCommand, type ParsedArgs, runMain } from 'citty'
import { once } from 'es-toolkit'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNewAuth } from '../../core/caiyun/service/auth.js'
import { getConfig } from './index.js'
import { init } from './service/utils.js'
import type { Config } from './types.js'

const logger = await createLogger() as ConsolaInstance

export const login = async (inputPath: string, index: string) => {
  const { config, path } = await getAuth(inputPath, index)

  const { $, jwtToken } = await init(config, { logger })
  if (!jwtToken) throw new Error('获取 jwtToken 失败')
  return { $, path }
}

const refreshAuth = async ($: M, path: string, index: string | number) => {
  const ok = await logger.prompt('是否确认刷新 auth？（Y/n）', { type: 'confirm' })

  if (!ok) return

  const auth = await getNewAuth($)
  if (auth) {
    rewriteConfigSync(path, ['caiyun', +index, 'auth'], auth)
    logger.success('刷新 auth 成功', auth)
    logger.success('成功写入文件', path, '文件')
  }
}

const setup = once(async (args: ParsedArgs<typeof operationArgs>) => {
  const { $, path } = await login(args.config, args.index)

  // 处理 refresh-auth
  if (args['refresh-auth']) {
    await refreshAuth($, path, args.index)
  }

  return { $, path }
})

const onceInit = once(init)

const operationArgs = {
  'config': {
    type: 'string',
    alias: 'c',
    description: '配置文件路径',
  },
  'index': {
    type: 'string',
    alias: 'i',
    description: '指定要操作的账号',
    default: '0',
    valueHint: '默认 0，即第一个账号',
  },
  'refresh-auth': {
    type: 'boolean',
    alias: 'r',
    description: '是否刷新 auth',
  },
} as const satisfies ArgsDef

const vipDay = defineCommand({
  args: {
    ...operationArgs,
  },
  async run({ args }) {
    logger.debug('vipDay', args)

    const { $ } = await setup(args)
  },
})

const main = defineCommand({
  meta: {
    name: 'caiyun',
    version: '1.0.0',
    description: 'caiyun 命令行工具',
  },
  args: {
    ...operationArgs,
    check: {
      type: 'boolean',
      description: '检查 auth 有效性',
    },
  },
  subCommands: {
    vipDay,
  },
  async run({ args, rawArgs }) {
    if (rawArgs.length === 0) {
      await interactive()
      return
    }

    if (args.check) {
      logger.fail('暂不支持检测')
    }

    await setup(args)
  },
})

runMain(main)

async function getAuth(inputPath: string, index: string | number) {
  const { config, path } = await getConfig(inputPath && resolve(dirname(fileURLToPath(import.meta.url)), inputPath))

  const _config = config[Number(index)]

  if (!_config) {
    throw new Error('账号不存在 请确认账号索引是否正确')
  }

  return {
    config: { ..._config, ...getAuthInfo(_config.auth) },
    path,
  }
}

/**
 * 交互模式
 */
async function interactive() {
  // const inputPath = await logger.prompt('请输入配置文件路径', { type: 'text', placeholder: '留空查看默认路径' })

  const { config, path } = await getConfig()

  logger.info('查看', path)
  logger.success('成功找到', config.length, '个配置，请选择需要操作的内容')

  const configMap = config.map(c => {
    try {
      return { ...c, ...getAuthInfo(c.auth) }
    } catch {
    }
  })

  const index = +await logger.prompt('请选择要操作的账号', {
    type: 'select',
    options: configMap.map((conf, i) => {
      if (!conf || !conf.phone) {
        return {
          label: `无效账号 ${i}`,
          value: String(i),
        }
      }

      return {
        label: hidePhone(conf.phone) + ` (${formatTime(conf.expire)}) ` + (conf.nickname ? `【${conf.nickname}】` : ''),
        value: String(i),
        hint: String(i),
      }
    }),
  }) as unknown as number

  const ACTION = {
    CHECK: 'check',
    REFRESH: 'refresh',
    LOGIN: 'login',
    CLOUD_DAY: 'cloudday',
    EXCHANGE: 'exchange',
  }

  const action = await logger.prompt('请选择你的操作', {
    type: 'select',
    options: [
      {
        label: '检查账号登录是否失效',
        value: ACTION.CHECK,
      },
      {
        label: '刷新 authorization token',
        value: ACTION.REFRESH,
      },
      {
        label: '移动云盘会员日宠爱礼',
        value: ACTION.CLOUD_DAY,
      },
      {
        label: '云朵兑换奖励',
        value: ACTION.EXCHANGE,
      },
    ],
  }) as unknown as typeof ACTION[keyof typeof ACTION]

  switch (action) {
    case ACTION.CHECK: {
      const { jwtToken } = await onceInit(configMap[index], { logger })
      if (!jwtToken) logger.fail('账号无效')
      else logger.success('账号有效')
      return
    }
    case ACTION.REFRESH: {
      const { $ } = await onceInit(configMap[index], { logger })
      await refreshAuth($, path, index)
      return
    }
    case ACTION.LOGIN: {
      logger.fail('暂不支持登录')
      return
    }
    case ACTION.CLOUD_DAY: {
      await cloudDay(configMap[index])
      return
    }
    case ACTION.EXCHANGE: {
      await exchange(configMap[index])
      return
    }
    default:
      return
  }
}

async function cloudDay(config: Config) {
  const { $ } = await onceInit(config, { logger })

  const list = await getCloudDayList($)

  const prizeId = await logger.prompt('请选择需要领取的礼物', {
    type: 'select',
    options: list.map((gift) => {
      return {
        label: gift.prizeName + (gift.prizeType === 1 ? `（钻石专享）` : ''),
        value: String(gift.prizeId),
      }
    }),
  }) as unknown as string

  const isVerify = await verifyCloudDay($, prizeId)

  if (!isVerify) return

  if (!await logger.prompt('是否发送短信验证码', { type: 'confirm' })) {
    logger.info('不发送验证码')
    return
  }

  if (!await getSmsVerCode($, prizeId)) {
    logger.fatal('获取验证码失败')
    return
  }

  const smsCode = await logger.prompt('请输入短信验证码', { type: 'text' })

  if (await logger.prompt('是否等待', { type: 'confirm' })) {
    logger.info('等待到下一个小时')
    await waitToNextHour()
  }

  await receiveCloudDayGift($, prizeId, smsCode)
}

async function exchange(config: Config) {
  const { $ } = await onceInit(config, { logger })

  const list = await getExchangeList($)

  const prizeId = +(await logger.prompt('请选择需要兑换的商品', {
    type: 'select',
    options: list.map((gift) => {
      return {
        label: gift.prizeId + `【${gift.prizeName}(${gift.pOrder})】` + `(${gift.dailyRemainderCount})`
          + `(${gift.count})`,
        value: String(gift.prizeId),
      }
    }),
  }) as unknown as string)

  const prize = list.find(g => g.prizeId === prizeId)!

  logger.info('选择了', prize.prizeId, prize.prizeName)
  logger.info('今日剩余：', prize.dailyRemainderCount, '/', prize.dailyCount)
  logger.info('本年度剩余：', prize.count, '/', prize.totalCount)

  const details = await getReceivePrizeDetails($, prize.prizeId)

  let smsCode: string

  if (details.verifycode === 0) {
    $.logger.info('需要短信验证')

    const isVerify = checkExchange($, prize)

    if (!isVerify) return

    if (!await logger.prompt('是否发送短信验证码', { type: 'confirm' })) {
      logger.info('不发送验证码')
      return
    }

    if (!await getSmsVerCode($, prizeId)) {
      logger.fatal('获取验证码失败')
      return
    }

    smsCode = await logger.prompt('请输入短信验证码', { type: 'text' })
  }

  if (await logger.prompt('是否等待', { type: 'confirm' })) {
    logger.info('等待到下一个小时')
    await waitToNextHour()
  }

  await exchangeApi($, prizeId, prize.prizeName, smsCode)
}
