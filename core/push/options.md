## 邮箱配置

- **类型**: `对象`

### `pass`

- **类型**: `字符串`
- **必填**: 是

邮箱密码/授权码

### `from`

- **类型**: `字符串`
- **必填**: 是

发件人邮箱

### `port`

- **类型**: `数字`
- **默认值**: `465`

端口

### `host`

- **类型**: `字符串`
- **必填**: 是

邮箱服务器

### `to`

- **类型**: `字符串`

收件人邮箱，默认发件人

### 示例

```json
{
  "email": {
    "pass": "spargo",
    "from": "Rebeca99@example.org",
    "port": 1525529081544704,
    "host": "tabula",
    "to": "Melvina.Shanahan61@example.net"
  }
}
```

### 默认值

```json
{
  "email": {
    "port": 465
  }
}
```

## 自定义配置

- **类型**: `数组`

自定义配置

### 示例

```json
{
  "customPost": [
    {
      "method": "POST",
      "url": "https://meek-offence.name",
      "headers": {
        "velum": "desparatus"
      },
      "body": {
        "arceo": "adipisci"
      },
      "data": {
        "decet": "vaco"
      },
      "timeout": 4948029649977344
    },
    {
      "method": "GET",
      "url": "https://unsung-expectancy.com/",
      "headers": {
        "desolo": "summa"
      },
      "body": {
        "cogito": "sub"
      },
      "data": {
        "infit": "cumque"
      },
      "timeout": 1655758766735360
    },
    {
      "method": "POST",
      "url": "https://muddy-cover.info/",
      "headers": {
        "adflicto": "voluptatibus"
      },
      "body": {
        "contra": "sodalitas"
      },
      "data": {
        "cubitum": "natus"
      },
      "timeout": 8625412554883072
    },
    {
      "method": "POST",
      "url": "https://little-poetry.net/",
      "headers": {
        "administratio": "accommodo"
      },
      "body": {
        "voluntarius": "degenero"
      },
      "data": {
        "comminor": "bellicus"
      },
      "timeout": 4834873262997504
    },
    {
      "method": "POST",
      "url": "https://linear-existence.net/",
      "headers": {
        "vinculum": "aspernatur"
      },
      "body": {
        "trans": "demum"
      },
      "data": {
        "necessitatibus": "creta"
      },
      "timeout": 8669997064781824
    }
  ]
}
```

### 默认值

```json
{
  "customPost": [
    {
      "method": "POST",
      "headers": {},
      "body": {},
      "data": {}
    }
  ]
}
```

## 企业微信 App 配置

- **类型**: `对象`

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### `touser`

- **类型**: `字符串`
- **默认值**: `"@all"`

接收人

### `agentid`

- **类型**: `数字`

### `corpsecret`

- **类型**: `字符串`

### `corpid`

- **类型**: `字符串`

### 示例

```json
{
  "workWeixin": {
    "msgtype": "mpnews",
    "touser": "@all",
    "agentid": 4120646571261952,
    "corpsecret": "totidem",
    "corpid": "distinctio"
  }
}
```

### 默认值

```json
{
  "workWeixin": {
    "msgtype": "text",
    "touser": "@all"
  }
}
```

## 企业微信机器人配置

- **类型**: `对象`

### `url`

- **类型**: `字符串`
- **必填**: 是

机器人 webhook

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "workWeixinBot": {
    "url": "https://honorable-armchair.info",
    "msgtype": "text"
  }
}
```

### 默认值

```json
{
  "workWeixinBot": {
    "msgtype": "text"
  }
}
```

## Bark 配置

- **类型**: `对象`

### `key`

- **类型**: `字符串`
- **必填**: 是

### `level`

- **类型**: `字符串`
- **默认值**: `"passive"`

消息等级

### 示例

```json
{
  "bark": {
    "key": "viriliter",
    "level": "passive"
  }
}
```

### 默认值

```json
{
  "bark": {
    "level": "passive"
  }
}
```

## 回逍配置

- **类型**: `对象`

### `key`

- **类型**: `字符串`
- **必填**: 是

### `sid`

- **类型**: `字符串`
- **必填**: 是

### `query`

- **类型**: `对象`
- **必填**: 是

#### `plat`

- **类型**: `字符串`

#### `group`

- **类型**: `字符串`

#### `icon`

- **类型**: `string,number`

推送 icon，详见其文档

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "twoIm": {
    "key": "stipes",
    "sid": "speciosus",
    "query": {
      "plat": "adfero",
      "group": "totam",
      "icon": "celo"
    },
    "msgtype": "text"
  }
}
```

### 默认值

```json
{
  "twoIm": {
    "query": {},
    "msgtype": "text"
  }
}
```

## ServerChan 配置

- **类型**: `对象`

### `token`

- **类型**: `字符串`
- **必填**: 是

### 示例

```json
{
  "serverChan": {
    "token": "talus"
  }
}
```

### 默认值

```json
{
  "serverChan": {}
}
```

## Telegram 配置

- **类型**: `对象`

### `apiHost`

- **类型**: `字符串`
- **默认值**: `"api.telegram.org"`

api 地址，默认官方地址，如果你有镜像 api 可以在此配置

### `token`

- **类型**: `字符串`
- **必填**: 是

### `chat_id`

- **类型**: `string,number`
- **必填**: 是

### `disable_web_page_preview`

- **类型**: `布尔值`
- **默认值**: `true`

### `proxy`

- **类型**: `字符串`

代理地址，例如 `http://127.0.0.1:10809` ，当然也可以使用验证，如 `http://catlair:passwd@127.0.0.1:10809`

### `agent`

- **类型**: `undefined`

### 示例

```json
{
  "tgBot": {
    "apiHost": "crastinus",
    "token": "vigilo",
    "chat_id": "ulterius",
    "disable_web_page_preview": false,
    "proxy": "https://unusual-shoat.net"
  }
}
```

### 默认值

```json
{
  "tgBot": {
    "apiHost": "api.telegram.org",
    "disable_web_page_preview": true
  }
}
```

## PushPlus 配置

- **类型**: `对象`

### `token`

- **类型**: `字符串`
- **必填**: 是

### 示例

```json
{
  "pushplus": {
    "token": "uter"
  }
}
```

### 默认值

```json
{
  "pushplus": {}
}
```

## 钉钉机器人配置

- **类型**: `对象`

### `token`

- **类型**: `字符串`
- **必填**: 是

### `secret`

- **类型**: `字符串`

密钥

### 示例

```json
{
  "dingTalk": {
    "token": "eos",
    "secret": "auctor"
  }
}
```

### 默认值

```json
{
  "dingTalk": {}
}
```
